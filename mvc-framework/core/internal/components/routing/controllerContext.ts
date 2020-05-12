import { RoutingAction } from "./routingAction.ts";
import { RoutingParams, ArgsParams } from "./routingParams.ts";
import { RoutingOptions } from "../../../interfaces/routing/routingOptions.ts";
import { InitializationStatus } from "../../../enums/internal/routingInitializationStatus.ts";
import { RoutingException } from "../../../exceptions/routingException.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { AnnotationMetadataContext } from "../../../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";
import { RoutingAnnotationContext } from "../../../interfaces/routing/routingAnnotationContext.ts";
import { routingParamContext } from "../../../interfaces/routing/routingParamContext.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";

export class ControllerComponent {
    
    private name?: string;
    private route?: string;
    private actions: Map<String, RoutingAction> = new Map<String, RoutingAction>();
    private classHandler: any;
    public options: RoutingOptions = {};

    constructor(name?: string, route?: string, handler?: any) {
        this.name = name;
        this.route = route;
        this.classHandler = handler;
        
        this.initializeRoutes();
    }

    public registerAction(routeAction: RoutingAction): void {
        let actionName: string = this.getActionName(routeAction.actionMethodName);
        let routingAction: RoutingAction = this.actions.get(actionName);

        if(routingAction != null && routingAction.initializationStatus == InitializationStatus.CREATED) throw new RoutingException(RoutingException.EXISTENT_ACTION, actionName);

        this.initializeRoutingActionContext(routeAction);
        
        if(this.existRoutingAction(routeAction.actionMethodName)) {
            let currentRoutingAction: RoutingAction = this.actions.get(actionName);
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
                let routeContext: RoutingAnnotationContext = <RoutingAnnotationContext> annotationContext.context;
                this.registerAction({
                    actionParent: routeContext.className,
                    actionType: routeContext.methodType,
                    actionMethodName: routeContext.methodName,
                    route: routeContext.route,
                    routingOptions: routeContext.options,
                    initializationStatus: InitializationStatus.CREATED
                });
            }
        });
    }

    private initializeRoutingActionContext(routeAction: RoutingAction) {
        routeAction.actionParent = this.getName();
        routeAction.routeParams = new Array<RoutingParams>();
        this.processParamRoutes(routeAction);
    }

    private processParamRoutes(routeAction: RoutingAction) {
        let routeParams: RoutingParams[] = RoutingUtils.findRouteParams(routeAction.route);
        if(routeParams == null) return;
        routeParams.forEach((value) => routeAction.routeParams.push(value));
    }

    public getActionRoute(routeAction: RoutingAction): string {
        if(this.getRoute() != null) return this.getRoute() + routeAction.route;
        else return routeAction.route;
    }

    public getRoutingAction(actionMethodName: string): RoutingAction {
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

    public getActions(): Map<String, RoutingAction> {
        return this.actions;
    }

}