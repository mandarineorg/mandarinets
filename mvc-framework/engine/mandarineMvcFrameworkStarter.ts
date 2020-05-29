import { Router } from "https://deno.land/x/oak/router.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ControllerComponent } from "../core/internal/components/routing/controllerContext.ts";
import { requestResolver, middlewareResolver } from "../core/internal/components/routing/routingResolver.ts";
import { Log } from "../../logger/log.ts";
import { SessionMiddleware } from "../core/middlewares/sessionMiddleware.ts";
import { MiddlewareComponent } from "../../main-core/components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { getMandarineConfiguration } from "../../main-core/configuration/getMandarineConfiguration.ts";

/**
 * This class works as the MVC engine and it is responsible for the initialization & behavior of HTTP requests.
 * It handles the initialization of controllers, routes, repository proxys, entity manager and others.
 * This class is the Mandarine Compiler since it is the most important class for the MVC framework to work as it resolves everything it needs
 */
export class MandarineMvcFrameworkStarter {

    private router: Router = new Router();

    private logger: Log = Log.getLogger(MandarineMvcFrameworkStarter);

    private essentials: {
        sessionMiddleware: SessionMiddleware
    } = {
        sessionMiddleware: undefined
    }

    constructor() {
        this.logger.info("Starting MVC Module");
        this.intializeControllersRoutes();
        this.initializeEssentials();
    }

    private initializeEssentials() {
        this.essentials.sessionMiddleware = new SessionMiddleware();
    }

    private intializeControllersRoutes(): void {
        let mvcControllers: Mandarine.MandarineCore.ComponentRegistryContext[] = ApplicationContext.getInstance().getComponentsRegistry().getControllers();

        if(mvcControllers.length == 0) {
            this.logger.warn("No controllers have been found"); 
            return;
        }

        try {

            mvcControllers.forEach((component: Mandarine.MandarineCore.ComponentRegistryContext, index) => {
                let controller: ControllerComponent = <ControllerComponent> component.componentInstance;
                controller.getActions().forEach((value, key) => {
                    this.router = this.addPathToRouter(this.router, value, controller);
                });
            });

            this.logger.info(`A total of ${mvcControllers.length} controllers have been initialized`);
        }catch(error){
            this.logger.error(`Controllers could not be initialized`, error);
        }

    }

    private preRequestInternalMiddlewares(context: any): void {
        this.essentials.sessionMiddleware.createSessionCookie(context);
    }

    private postRequestInternalMiddlewares(context: any): void {
        this.essentials.sessionMiddleware.storeSession(context);
    }

    private async executeUserMiddlewares(preRequestMiddleware: boolean, middlewares: Array<MiddlewareComponent>, context: any, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction): Promise<boolean> {
        for(const middlewareComponent of middlewares) {
            if(middlewareComponent.regexRoute.test(context.request.url.toString())) {
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

            this.preRequestInternalMiddlewares(context); // Execute internal middleware like sessions
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
        let contentType: string = getMandarineConfiguration().mandarine.server.responseType;

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