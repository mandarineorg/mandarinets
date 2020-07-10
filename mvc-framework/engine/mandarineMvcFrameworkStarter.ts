// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Router } from "../../deps.ts";
import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MiddlewareComponent } from "../../main-core/components/middleware-component/middlewareComponent.ts";
import { WebMVCConfigurer } from "../../main-core/mandarine-native/mvc/webMvcConfigurer.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ControllerComponent } from "../core/internal/components/routing/controllerContext.ts";
import { middlewareResolver, requestResolver } from "../core/internal/components/routing/routingResolver.ts";
import { handleCors } from "../core/middlewares/cors/corsMiddleware.ts";
import { SessionMiddleware } from "../core/middlewares/sessionMiddleware.ts";

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
        webMvcConfigurer: WebMVCConfigurer
    } = {
        sessionMiddleware: undefined,
        webMvcConfigurer: undefined
    }

    constructor(callback?: Function) {
        this.logger.compiler("Starting MVC Module", "info");

        if(callback) {
            callback(this);
        }
    }

    public initializeEssentials() {
        this.essentials.sessionMiddleware = new SessionMiddleware();
        this.essentials.webMvcConfigurer = new WebMVCConfigurer();
    }

    public intializeControllersRoutes(): void {
        let mvcControllers: Mandarine.MandarineCore.ComponentRegistryContext[] = ApplicationContext.getInstance().getComponentsRegistry().getControllers();

        ApplicationContext.CONTEXT_METADATA.engineMetadata.mvc.controllersAmount = mvcControllers.length;

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

    private handleCorsMiddleware(context: any, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent) {
        let classLevelCors = controllerComponent.options.cors;
        let methodLevelCors = routingAction.routingOptions.cors;
        handleCors(context, (classLevelCors) ? classLevelCors : methodLevelCors, true);
    }

    private preRequestInternalMiddlewares(context: any, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): void {
        this.essentials.sessionMiddleware.createSessionCookie(context);
        this.handleCorsMiddleware(context, routingAction, controllerComponent);
    }

    private postRequestInternalMiddlewares(context: any): void {
        this.essentials.sessionMiddleware.storeSession(context);
    }

    private async executeUserMiddlewares(preRequestMiddleware: boolean, middlewares: Array<MiddlewareComponent>, context: any, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction): Promise<boolean> {
        for(const middlewareComponent of middlewares) {
            let finalRegex = new RegExp(context.request.url.host + middlewareComponent.regexRoute.source);
            if(finalRegex.test(context.request.url.host + context.request.url.pathname)) {
                let middlewareResolved: boolean = await middlewareResolver(preRequestMiddleware, middlewareComponent, routingAction, context);

                if(preRequestMiddleware) {
                    return middlewareResolved;
                } else {
                    return true;
                }
            }
        }
        return true;
    }

    private addPathToRouter(router: Router, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, controllerComponent: ControllerComponent): Router {
        let route: string = controllerComponent.getActionRoute(routingAction);

        let availableMiddlewares: Array<MiddlewareComponent> = Mandarine.Global.getMiddleware();

        let responseHandler = async (context) => {

            this.preRequestInternalMiddlewares(context, routingAction, controllerComponent); // Execute internal middleware like sessions
            let continueRequest: boolean = await this.executeUserMiddlewares(true, availableMiddlewares, context, routingAction); // If the user has any middleware, execute it

            if(continueRequest) {

                await requestResolver(routingAction, context);

                MandarineMvcFrameworkStarter.assignContentType(context);

                this.executeUserMiddlewares(false, availableMiddlewares, context, routingAction);
                this.postRequestInternalMiddlewares(context);
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

    private static assignContentType(context: any) {
        let contentType: string = Mandarine.Global.getMandarineConfiguration().mandarine.server.responseType;

        if(context.response.body != (null || undefined)) {
            switch(typeof context.response.body) {
                case "object":
                    contentType = Mandarine.MandarineMVC.MediaTypes.APPLICATION_JSON;
                break;
            }
        }
        context.response.headers.set('Content-Type', contentType);
    }
}