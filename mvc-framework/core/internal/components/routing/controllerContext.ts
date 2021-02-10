// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { blue, red } from "https://deno.land/std@0.84.0/fmt/colors.ts";
import { MandarineException } from "../../../../../main-core/exceptions/mandarineException.ts";
import { RoutingException } from "../../../../../main-core/exceptions/routingException.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { CommonUtils } from "../../../../../main-core/utils/commonUtils.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import type { AnnotationMetadataContext } from "../../../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";
import { MandarineMVCContext } from "../../../mandarineMvcContext.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { MiddlewareUtil } from "../../../../../main-core/utils/components/middlewareUtil.ts";
import type { NonComponentMiddlewareTarget } from "../../../../../main-core/internals/interfaces/middlewareTarget.ts";
import { ComponentComponent } from "../../../../../main-core/components/component-component/componentComponent.ts";
/**
 * This class is used in the DI Container for Mandarine to store components annotated as @Controller
 * It contains all the behavior of a controller, like its routes and the methods of the routes.
 */
export class ControllerComponent {
    
    private name?: string;
    private route?: string;
    private actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = new Map<String, Mandarine.MandarineMVC.Routing.RoutingAction>();
    private classHandler: any;
    private classHandlerType: any;
    public options: Mandarine.MandarineMVC.Routing.RoutingOptions & any = {
        responseStatus: Mandarine.MandarineMVC.HttpStatusCode.OK
    };

    constructor(name?: string, route?: string, handlerType?: any, handler?: any) {
        this.name = name;
        this.route = route;
        this.classHandler = handler;
        // We get the type of the handler class just in case we need it to read annotations, or other use cases we might have.
        this.classHandlerType = handlerType;
    }

    public initializeControllerFunctionality() {
        this.initializeRoutes();
        this.initializeControllerOptions();
        this.initializeTopLevelMiddleware();
    }

    public registerAction(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction): void {
        let actionName: string = this.getActionName(routeAction.actionMethodName);
        let routingAction: Mandarine.MandarineMVC.Routing.RoutingAction | undefined = this.actions.get(actionName);

        if(routingAction != null && routingAction.initializationStatus == Mandarine.MandarineMVC.Routing.RouteInitializationStatus.CREATED) throw new RoutingException(RoutingException.EXISTENT_ACTION);

        this.initializeRoutingActionContext(routeAction);
        
        if(this.existRoutingAction(routeAction.actionMethodName)) {
            let currentRoutingAction: Mandarine.MandarineMVC.Routing.RoutingAction | undefined = this.actions.get(actionName);
            if(currentRoutingAction) {
                currentRoutingAction.actionMethodName = routeAction.actionMethodName;
                currentRoutingAction.actionType = routeAction.actionType;
                currentRoutingAction.route = routeAction.route;
                currentRoutingAction.routingOptions = routeAction.routingOptions;
                currentRoutingAction.routeParams = routeAction.routeParams;
                this.actions.set(actionName, currentRoutingAction);
            }
        } else {
            this.actions.set(actionName, routeAction);
        }
    }

    private initializeControllerOptions(): void {
        const REFLECTION_OPTIONS: any = {
            cors: MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE, 
            withPermissions: MandarineConstants.REFLECTION_MANDARINE_SECURITY_ALLOWONLY_DECORATOR,
            responseStatus: MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE,
            middleware: MandarineConstants.REFLECTION_MANDARINE_USE_MIDDLEWARE_DECORATOR,
            guards: MandarineConstants.REFLECTION_MANDARINE_USE_GUARDS_DECORATOR
        };
        let metadataKeysFromClass: Array<any> = Reflect.getMetadataKeys(this.getClassHandlerType());

        Object.keys(REFLECTION_OPTIONS).forEach((interfaceKey: string) => {
            const optionLookup = REFLECTION_OPTIONS[interfaceKey];
            const metadata: Array<any> = metadataKeysFromClass?.find((metadataKey: string) => metadataKey === optionLookup);
            if(metadata) {
                const metadataValue: any = Reflect.getMetadata(metadata, this.getClassHandlerType());
                this.options[interfaceKey] = metadataValue;
            }
        });
    }

    private initializeRouteContextOptions(routeContext: Mandarine.MandarineMVC.Routing.RoutingAnnotationContext, classHandler: any) {
        const ROUTE_REFLECTION_OPTIONS: any = {
            "cors": MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE,
            withPermissions: MandarineConstants.REFLECTION_MANDARINE_SECURITY_ALLOWONLY_DECORATOR,
            responseStatus: MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE,
            middleware: MandarineConstants.REFLECTION_MANDARINE_USE_MIDDLEWARE_DECORATOR,
            guards: MandarineConstants.REFLECTION_MANDARINE_USE_GUARDS_DECORATOR
        }
        if(!routeContext.options) routeContext.options = {};

        Object.keys(ROUTE_REFLECTION_OPTIONS).forEach((interfaceKey) => {
            const metadataValue: any = Reflect.getMetadata(`${ROUTE_REFLECTION_OPTIONS[interfaceKey]}:${routeContext.methodName}`, classHandler, routeContext.methodName);
            if(metadataValue) {
                routeContext.options[interfaceKey] = metadataValue;
            }
        })
    }

    public initializeMiddleware(middlewareList: Array<NonComponentMiddlewareTarget | Mandarine.Types.MiddlewareComponent> | undefined): Array<NonComponentMiddlewareTarget | Mandarine.Types.MiddlewareComponent> {
        if(!middlewareList) return [];

        const newMiddlewareList = [...middlewareList];
        newMiddlewareList.forEach((item, index) => {
            let middlewareHandler: NonComponentMiddlewareTarget | Mandarine.Types.MiddlewareComponent;

            if(CommonUtils.isObject(item)) {
                middlewareHandler = item;
            } else {
                middlewareHandler = ApplicationContext.getInstance().getDIFactory().getComponentByType(item);
            }

            if(!middlewareHandler) throw new MandarineException(MandarineException.INVALID_MIDDLEWARE_UNDEFINED);
            
            if(middlewareHandler instanceof ComponentComponent) {
                MiddlewareUtil.verifyImplementation(middlewareHandler.getClassHandler());
            } else {
                MiddlewareUtil.verifyImplementation(middlewareHandler);
            }

            newMiddlewareList[index] = middlewareHandler;
        });

        return newMiddlewareList || [];
    }

    public initializeTopLevelMiddleware() {
        this.options.middleware = this.initializeMiddleware(this.options.middleware) || [];
    }

    private initializeRoutes(): void {
        let classHandler: any = this.getClassHandler();
        classHandler = (ReflectUtils.checkClassInitialized(this.getClassHandler())) ? classHandler : new classHandler();

        let metadataKeysFromClass: Array<any> = Reflect.getMetadataKeys(classHandler);
        if(metadataKeysFromClass == (null || undefined)) return;
        let routesMetadataKeys: Array<any> = metadataKeysFromClass.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE}:`));
        if(routesMetadataKeys == (null || undefined)) return;
        routesMetadataKeys.forEach((value) => {
            let annotationContext: AnnotationMetadataContext = <AnnotationMetadataContext> Reflect.getMetadata(value, classHandler);
            if(annotationContext.type == "ROUTE") {
                let routeContext: Mandarine.MandarineMVC.Routing.RoutingAnnotationContext = <Mandarine.MandarineMVC.Routing.RoutingAnnotationContext> annotationContext.context;
                this.initializeRouteContextOptions(routeContext, classHandler);

                routeContext.options.middleware = this.initializeMiddleware(routeContext.options.middleware) || [];

                const fullRoute = this.getFullRoute(routeContext.route);
                const routingAction: Mandarine.MandarineMVC.Routing.RoutingAction = {
                    actionParent: routeContext.className,
                    actionType: routeContext.methodType,
                    actionMethodName: routeContext.methodName,
                    route: fullRoute,
                    routingOptions: routeContext.options,
                    initializationStatus: Mandarine.MandarineMVC.Routing.RouteInitializationStatus.CREATED,
                    routeSignature: <Array<string>> RoutingUtils.findRouteParamSignature(fullRoute, routeContext.methodType)
                };

                this.registerAction(routingAction);
            }
        });
    }

    private initializeRoutingActionContext(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction) {
        this.validateRouteSignature(routeAction.routeSignature);
        routeAction.actionParent = this.getName();
        routeAction.routeParams = new Array<Mandarine.MandarineMVC.Routing.RoutingParams>();
        this.processParamRoutes(routeAction);
    }

    private processParamRoutes(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction) {
        let routeParams: Mandarine.MandarineMVC.Routing.RoutingParams[] | null = RoutingUtils.findRouteParams(routeAction.route);
        if(routeParams == null) return;
        routeParams.forEach((value) => routeAction?.routeParams?.push(value));
    }

    public getFullRoute(route: string) {
        if(this.getRoute() != (null || undefined)) return this.getRoute() + route;
        else return route;
    }

    public getActionRoute(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction): string {
        return this.getFullRoute(routeAction.route);
    }

    public getRoutingAction(actionMethodName: string): Mandarine.MandarineMVC.Routing.RoutingAction | undefined {
        return this.actions.get(`${this.getName()}.${actionMethodName}`);
    }

    public existRoutingAction(actionMethodName: string): boolean {
        if(this.getRoutingAction(actionMethodName) == null) return false;
        else return true;
    }

    public validateRouteSignature(routeSignature: Array<string> | null) {
        if(routeSignature) {
            const currentRoutes = MandarineMVCContext.getInstance().routeSignatures;

            if(currentRoutes.some((currentRouteSignature) => CommonUtils.arrayIdentical(currentRouteSignature, routeSignature))) {
                let errorMessage = MandarineException.ROUTE_ALREADY_EXIST.replace("$s", `${blue(Mandarine.MandarineMVC.HttpMethods[(parseInt(routeSignature[0]))])} ${red(routeSignature.slice(1).join("/"))}`);
                throw new MandarineException(errorMessage);
            }

            MandarineMVCContext.getInstance().routeSignatures.push(routeSignature);
        } else {
            throw new MandarineException(MandarineException.INVALID_ROUTE_SIGNATURE_NULL);
        }
    }

    public getActionName(methodName: string): string {
        return `${this.getName()}.${methodName}`;
    }

    public getName(): string {
        return this.name || "";
    }

    public getRoute(): string {
        return this.route || "";
    }

    public setRoute(route: string | undefined): void {
        if(route) {
            this.route = route;
        }
    }

    public setClassHandler(classHandler: any) {
        this.classHandler = classHandler;
    }

    public getClassHandler(): any {
        return this.classHandler;
    }

    public getClassHandlerType(): any {
        return this.classHandlerType;
    }

    public getClassHandlerPrimitive() {
        return this.getClassHandlerType();
    }

    public getActions(): Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> {
        return this.actions;
    }

}