import { ServerRequest } from "https://deno.land/std@v1.0.0-rc1/http/server.ts";
import { RoutingAction } from "./routingAction.ts";
import { ControllerComponent } from "./controllerContext.ts";
import { ArgValue, getRoutingMethodArguments } from "./RoutingMethodArguments.ts";
import { ComponentRegistryContext } from "../../../../../main-core/components-registry/componentRegistryContext.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { MethodArgumentsResolver } from "../../../../../main-core/dependency-injection/methodArgumentsResolver.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";


export const requestResolver = async (routingAction: RoutingAction, request: ServerRequest, response: any, params: any) => {
    let objectContext: ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(routingAction.actionParent);
    let component: ControllerComponent = <ControllerComponent> objectContext.componentInstance;
    let handler: any = component.getClassHandler();
    let handlerMethod: any = handler[routingAction.actionMethodName];
    let handlerMethodParams: Array<string> = ReflectUtils.getParamNames(handlerMethod);
    let methodArgs: ArgValue[] = MethodArgumentsResolver(handler, routingAction.actionMethodName, {
        request: request,
        response: response,
        params: params,
        routingAction: routingAction
    });
    // We dont use the variable handlerMethod because if we do it will loose the context and so the dependency injection will fail.
    // So if the method we are invoking uses dependents, the dispatcher will fail.
    // with that said we have to use nativaly the class and the method as if we are invoking the whole thing.
    if(methodArgs == null) return handler[routingAction.actionMethodName]();
    else return handler[routingAction.actionMethodName](...methodArgs);
};