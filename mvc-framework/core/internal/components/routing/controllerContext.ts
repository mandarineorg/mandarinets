import { RoutingException } from "../../../exceptions/routingException.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { AnnotationMetadataContext } from "../../../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { ResponseStatusMetadataContext } from "../../../decorators/stereotypes/controller/responseStatus.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export class ControllerComponent {
    
    private name?: string;
    private route?: string;
    private actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = new Map<String, Mandarine.MandarineMVC.Routing.RoutingAction>();
    private classHandler: any;
    private classHandlerType: any;
    public options: Mandarine.MandarineMVC.Routing.RoutingOptions = {};

    constructor(name?: string, route?: string, handlerType?: any, handler?: any) {
        this.name = name;
        this.route = route;
        this.classHandler = handler;
        // We get the type of the handler class just in case we need it to read annotations, or other use cases we might have.
        this.classHandlerType = handlerType;
    }

    public initializeControllerFunctionality() {
        this.initializeRoutes();
        this.initializeDefaultResponseStatus();
    }

    public registerAction(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction): void {
        let actionName: string = this.getActionName(routeAction.actionMethodName);
        let routingAction: Mandarine.MandarineMVC.Routing.RoutingAction = this.actions.get(actionName);

        if(routingAction != null && routingAction.initializationStatus == Mandarine.MandarineMVC.Routing.RouteInitializationStatus.CREATED) throw new RoutingException(RoutingException.EXISTENT_ACTION, actionName);

        this.initializeRoutingActionContext(routeAction);
        
        if(this.existRoutingAction(routeAction.actionMethodName)) {
            let currentRoutingAction: Mandarine.MandarineMVC.Routing.RoutingAction = this.actions.get(actionName);
            currentRoutingAction.actionMethodName = routeAction.actionMethodName;
            currentRoutingAction.actionType = routeAction.actionType;
            currentRoutingAction.route = routeAction.route;
            currentRoutingAction.routingOptions = routeAction.routingOptions;
            currentRoutingAction.routeParams = routeAction.routeParams;
            this.actions.set(actionName, currentRoutingAction);
        } else {
            this.actions.set(actionName, routeAction);
        }
    }

    private initializeDefaultResponseStatus(): void {
        let metadataKeysFromClass: Array<any> = Reflect.getMetadataKeys(this.getClassHandlerType());
        if(metadataKeysFromClass == (null || undefined)) return;

        let defaultResponseStatusMetadataKey: Array<any> = metadataKeysFromClass.find((metadataKey: string) => metadataKey === `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE}`);
        if(defaultResponseStatusMetadataKey == (null || undefined)) {
            this.options.responseStatus = Mandarine.MandarineMVC.HttpStatusCode.OK;
            return;
        }

        let defaultStatusAnnotationContext: ResponseStatusMetadataContext = <ResponseStatusMetadataContext> Reflect.getMetadata(defaultResponseStatusMetadataKey, this.getClassHandlerType());
        this.options.responseStatus = defaultStatusAnnotationContext.responseStatus;
    }

    private initializeRoutes(): void {
        let classHandler: any = this.getClassHandler();
        classHandler = (ReflectUtils.checkClassInitialized(this.getClassHandler())) ? classHandler : new classHandler();

        let metadataKeysFromClass: Array<any> = Reflect.getMetadataKeys(classHandler);
        if(metadataKeysFromClass == (null || undefined)) return;
        let routesMetadataKeys: Array<any> = metadataKeysFromClass.filter((metadataKey: string) => metadataKey.startsWith(`mandarine-method-route:`));
        if(routesMetadataKeys == (null || undefined)) return;
        routesMetadataKeys.forEach((value) => {
            let annotationContext: AnnotationMetadataContext = <AnnotationMetadataContext> Reflect.getMetadata(value, classHandler);
            if(annotationContext.type == "ROUTE") {
                let routeContext: Mandarine.MandarineMVC.Routing.RoutingAnnotationContext = <Mandarine.MandarineMVC.Routing.RoutingAnnotationContext> annotationContext.context;
                this.registerAction({
                    actionParent: routeContext.className,
                    actionType: routeContext.methodType,
                    actionMethodName: routeContext.methodName,
                    route: routeContext.route,
                    routingOptions: routeContext.options,
                    initializationStatus: Mandarine.MandarineMVC.Routing.RouteInitializationStatus.CREATED
                });
            }
        });
    }

    private initializeRoutingActionContext(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction) {
        routeAction.actionParent = this.getName();
        routeAction.routeParams = new Array<Mandarine.MandarineMVC.Routing.RoutingParams>();
        this.processParamRoutes(routeAction);
    }

    private processParamRoutes(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction) {
        let routeParams: Mandarine.MandarineMVC.Routing.RoutingParams[] = RoutingUtils.findRouteParams(routeAction.route);
        if(routeParams == null) return;
        routeParams.forEach((value) => routeAction.routeParams.push(value));
    }

    public getActionRoute(routeAction: Mandarine.MandarineMVC.Routing.RoutingAction): string {
        if(this.getRoute() != null) return this.getRoute() + routeAction.route;
        else return routeAction.route;
    }

    public getRoutingAction(actionMethodName: string): Mandarine.MandarineMVC.Routing.RoutingAction {
        return this.actions.get(`${this.getName()}.${actionMethodName}`);
    }

    public existRoutingAction(actionMethodName: string): boolean {
        if(this.getRoutingAction(actionMethodName) == null) return false;
        else return true;
    }

    public getActionName(methodName: string): string {
        return `${this.getName()}.${methodName}`;
    }

    public getName(): string {
        return this.name;
    }

    public getRoute(): string {
        return this.route;
    }

    public setRoute(route: string): void {
        this.route = route;
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

    public getActions(): Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> {
        return this.actions;
    }

}