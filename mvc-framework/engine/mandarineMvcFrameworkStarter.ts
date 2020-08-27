// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Router } from "../../deps.ts";
import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { ControllerComponent } from "../core/internal/components/routing/controllerContext.ts";
import { middlewareResolver, requestResolver } from "../core/internal/components/routing/routingResolver.ts";
import { handleCors } from "../core/middlewares/cors/corsMiddleware.ts";
import { SessionMiddleware } from "../core/middlewares/sessionMiddleware.ts";
import { AuthenticationRouting } from "../core/internal/auth/authenticationRouting.ts";
import { VerifyPermissions } from "../../security-core/core/internals/permissions/verifyPermissions.ts";
import { ComponentComponent } from "../../main-core/components/component-component/componentComponent.ts";
import { NonComponentMiddlewareTarget } from "../../main-core/internals/interfaces/middlewareTarget.ts";

/**
 * This class works as the MVC engine and it is responsible for the initialization & behavior of HTTP requests.
 * It handles the initialization of controllers, routes, repository proxys, entity manager and others.
 * This class is the Mandarine Compiler since it is the most important class for the MVC framework to work as it resolves everything it needs
 */
export class MandarineMvcFrameworkStarter {

    private router: Router = new Router();

    private logger: Log = Log.getLogger(MandarineMvcFrameworkStarter);

    private essentials: {
        sessionMiddleware: SessionMiddleware,
    } = {
        sessionMiddleware: undefined,
    }

    constructor(callback?: Function) {
        this.logger.compiler("Starting MVC Module", "info");

        if(callback) {
            callback(this);
        }
    }

    public initializeEssentials() {
        this.essentials.sessionMiddleware = new SessionMiddleware();
    }

    public intializeControllersRoutes(): void {
        let mvcControllers: Mandarine.MandarineCore.ComponentRegistryContext[] = ApplicationContext.getInstance().getComponentsRegistry().getControllers();

        ApplicationContext.CONTEXT_METADATA.engineMetadata.mvc.controllersAmount = mvcControllers.length;

        const authenticationRoute = new AuthenticationRouting();
        this.router = authenticationRoute.initialize(this.router);

        try {
            mvcControllers.forEach((component: Mandarine.MandarineCore.ComponentRegistryContext, index) => {
                let controller: ControllerComponent = <ControllerComponent> component.componentInstance;
                controller.getActions().forEach((value, key) => {
                    this.router = this.addPathToRouter(this.router, value, controller);
                });
            });
        }catch(error){
            this.logger.compiler(`Controllers could not be initialized`, "error", error);
        }

    }

    private handleCorsMiddleware(context: Mandarine.Types.RequestContext, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent) {
        let classLevelCors = controllerComponent.options.cors;
        let methodLevelCors = routingAction.routingOptions.cors;
        handleCors(context, (classLevelCors) ? classLevelCors : methodLevelCors, true);
    }

    private preRequestInternalMiddlewares(context: Mandarine.Types.RequestContext, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): void {
        this.essentials.sessionMiddleware.createSessionCookie(context);
        this.handleCorsMiddleware(context, routingAction, controllerComponent);
    }

    private postRequestInternalMiddlewares(context: Mandarine.Types.RequestContext): void {
        this.essentials.sessionMiddleware.storeSession(context);
    }

    private async executeUserMiddlewares(preRequestMiddleware: boolean, middlewares: Array<Mandarine.Types.MiddlewareComponent | NonComponentMiddlewareTarget>, context: Mandarine.Types.RequestContext): Promise<boolean> {
        for(const middlewareComponent of middlewares) {
            if(middlewareComponent instanceof ComponentComponent) {
                let middlewareResolved: boolean;
                const resolveMiddleware = async () => await middlewareResolver(preRequestMiddleware, <Mandarine.Types.MiddlewareComponent> middlewareComponent, context);
                if(middlewareComponent.configuration.regexRoute) {
                    let finalRegex = new RegExp(context.request.url.host + middlewareComponent.configuration.regexRoute.source);
                    if(finalRegex.test(context.request.url.host + context.request.url.pathname)) {
                        middlewareResolved = await resolveMiddleware();
                    }
                }  else {
                    middlewareResolved = await resolveMiddleware();
                }

                if(preRequestMiddleware && middlewareResolved === false) {
                    return middlewareResolved;
                }
            } else {
                if(preRequestMiddleware) {
                    const execution = middlewareComponent.onPreRequest(context.request, context.response);
                    if(execution === false) return false;
                } else {
                    middlewareComponent.onPostRequest(context.request, context.response);
                }
            }
        }
        return true;
    }

    private addPathToRouter(router: Router, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): Router {
        let route: string = routingAction.route;

        let availableMiddlewares: Array<Mandarine.Types.MiddlewareComponent | NonComponentMiddlewareTarget> = [...Mandarine.Global.getMiddleware()];
        availableMiddlewares = availableMiddlewares.concat((routingAction.routingOptions.middleware || [])).concat((controllerComponent.options.middleware || []));


        let responseHandler = async (context, next) => {

            if(context.isResource) {
                await next();
                return;
            }

            const controllerPermissions = controllerComponent.options.withPermissions;
            const routePermissions = routingAction.routingOptions.withPermissions;
            let allowed = true;

            if(controllerPermissions) {
                allowed = VerifyPermissions(controllerPermissions, context.request);
            }
            if(routePermissions && allowed) {
                allowed = VerifyPermissions(routePermissions, context.request);
            }

            if(!allowed) {
                context.response.status = 401;
                return;
            }

            this.preRequestInternalMiddlewares(context, routingAction, controllerComponent); // Execute internal middleware like sessions
            let continueRequest: boolean = await this.executeUserMiddlewares(true, availableMiddlewares, context); // If the user has any middleware, execute it

            if(continueRequest) {
                await requestResolver(routingAction, context);

                this.executeUserMiddlewares(false, availableMiddlewares, context);
                this.postRequestInternalMiddlewares(context);

                if(context.request.url.pathname === routingAction.route) {
                    return;
                } else {
                    await next();
                }
            }

        };

        switch(routingAction.actionType) {
            case Mandarine.MandarineMVC.HttpMethods.GET:
                return router.get(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.POST:
                return router.post(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.DELETE:
                return router.delete(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.OPTIONS:
                return router.options(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.PUT:
                return router.put(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.PATCH:
                return router.patch(route, responseHandler);
            case Mandarine.MandarineMVC.HttpMethods.HEAD:
                return router.head(route, responseHandler);
        }
    }

    public getRouter(): Router {
        return this.router;
    }

}