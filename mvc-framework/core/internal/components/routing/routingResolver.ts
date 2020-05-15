import { ControllerComponent } from "./controllerContext.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { Request } from "https://deno.land/x/oak/request.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";
import { MiddlewareComponent } from "../../../../../main-core/components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const requestResolver = async (routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, request: Request, response: any, params: any) => {
    let objectContext: Mandarine.MandarineCore.ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(routingAction.actionParent);
    let component: ControllerComponent = <ControllerComponent> objectContext.componentInstance;
    let handler: any = component.getClassHandler();

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
        response.status = Mandarine.MandarineMVC.HttpStatusCode.OK;
    }

    // We dont use the variable handlerMethod because if we do it will loose the context and so the dependency injection will fail.
    // So if the method we are invoking uses dependents, the dispatcher will fail.
    // with that said we have to use nativaly the class and the method as if we are invoking the whole thing.
    if(methodArgs == null) return handler[routingAction.actionMethodName]();
    else return handler[routingAction.actionMethodName](...methodArgs);
};

export const middlewareResolver = async (preRequest: boolean, middlewareComponent: MiddlewareComponent, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, request: Request, response: any, params: any): Promise<boolean> => {

    let handler = middlewareComponent.getClassHandler();
    let methodName: string = (preRequest) ? "onPreRequest" : "onPostRequest";

    let methodArgs: DI.ArgumentValue[] = await DI.methodArgumentResolver(handler, methodName, {
        request: request,
        response: response,
        params: params,
        routingAction: routingAction
    });

    if(preRequest) {
        if(methodArgs == null) {
            return handler[methodName]();
        } else {
            return handler[methodName](...methodArgs);
        }
    } else {
        if(methodArgs == null) {
            handler[methodName]();
            return undefined;
        } else {
            handler[methodName](...methodArgs);
            return undefined;
        }
    }
};