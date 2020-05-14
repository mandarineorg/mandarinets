import { RoutingAction } from "./routingAction.ts";
import { ControllerComponent } from "./controllerContext.ts";
import { ComponentRegistryContext } from "../../../../../main-core/components-registry/componentRegistryContext.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { Request } from "https://deno.land/x/oak/request.ts";
import { HttpStatusCode } from "../../../enums/http/httpCodes.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";

export const requestResolver = async (routingAction: RoutingAction, request: Request, response: any, params: any) => {
    let objectContext: ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(routingAction.actionParent);
    let component: ControllerComponent = <ControllerComponent> objectContext.componentInstance;
    let handler: any = component.getClassHandler();
    let handlerMethod: any = handler[routingAction.actionMethodName];
    let handlerMethodParams: Array<string> = ReflectUtils.getParamNames(handlerMethod);
    let methodArgs: DI.ArgumentValue[] = await DI.methodArgumentResolver(handler, routingAction.actionMethodName, {
        request: request,
        response: response,
        params: params,
        routingAction: routingAction
    });

    // Modify Response Status
    if(routingAction.routingOptions != undefined && routingAction.routingOptions.responseStatus != (undefined || null)) {
        response.status = routingAction.routingOptions.responseStatus;
    } else if(component.options.responseStatus != (undefined || null)) {
        response.status = component.options.responseStatus;
    } else {
        response.status = HttpStatusCode.OK;
    }

    // We dont use the variable handlerMethod because if we do it will loose the context and so the dependency injection will fail.
    // So if the method we are invoking uses dependents, the dispatcher will fail.
    // with that said we have to use nativaly the class and the method as if we are invoking the whole thing.
    if(methodArgs == null) return handler[routingAction.actionMethodName]();
    else return handler[routingAction.actionMethodName](...methodArgs);
};