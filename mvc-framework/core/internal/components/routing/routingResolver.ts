import { ControllerComponent } from "./controllerContext.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { Request } from "https://deno.land/x/oak/request.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";
import { MiddlewareComponent } from "../../../../../main-core/components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { Cookies } from "https://deno.land/x/oak/cookies.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { ViewModel } from "../../../modules/view-engine/viewModel.ts";

/**
 * Resolves the request made to an endpoint. 
 * This method works along with the DI container.
 */
export const requestResolver = async (routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, context: any) => {
    let objectContext: Mandarine.MandarineCore.ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(routingAction.actionParent);
    let component: ControllerComponent = <ControllerComponent> objectContext.componentInstance;
    let handler: any = component.getClassHandler();

    let methodArgs: DI.ArgumentValue[] = await DI.methodArgumentResolver(handler, routingAction.actionMethodName, {
        request: context.request,
        response: context.response,
        params: context.params,
        cookies: context.cookies,
        routingAction: routingAction
    });

    // Modify Response Status
    if(routingAction.routingOptions != undefined && routingAction.routingOptions.responseStatus != (undefined || null)) {
        context.response.status = routingAction.routingOptions.responseStatus;
    } else if(component.options.responseStatus != (undefined || null)) {
        context.response.status = component.options.responseStatus;
    } else {
        context.response.status = Mandarine.MandarineMVC.HttpStatusCode.OK;
    }

    // We dont use the variable handlerMethod because if we do it will loose the context and so the dependency injection will fail.
    // So if the method we are invoking uses dependents, the dispatcher will fail.
    // with that said we have to use nativaly the class and the method as if we are invoking the whole thing.
    let methodValue: any = undefined;
    if(handler[routingAction.actionMethodName] instanceof Mandarine.AsyncFunction) {
        methodValue = (methodArgs == null) ? await handler[routingAction.actionMethodName]() : await handler[routingAction.actionMethodName](...methodArgs);
    } else {
        methodValue = (methodArgs == null) ? handler[routingAction.actionMethodName]() : handler[routingAction.actionMethodName](...methodArgs);
    }
    let isRenderable: boolean = false;

    let renderInformation: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData = Reflect.getMetadata(`${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE_RENDER}:${routingAction.actionMethodName}`, handler, routingAction.actionMethodName);
    isRenderable = renderInformation != undefined;
    if(isRenderable) {
        context.response.body = Mandarine.MandarineMVC.TemplateEngine.RenderEngine.render(renderInformation, renderInformation.engine, (methodValue == (null || undefined)) ? {} : methodValue);
    } else {
        context.response.body = methodValue;
    }
};

/**
 * Resolves the middleware request made to an endpoint. 
 */
export const middlewareResolver = async (preRequest: boolean, middlewareComponent: MiddlewareComponent, routingAction: Mandarine.MandarineMVC.Routing.RoutingAction, context: any): Promise<boolean> => {

    let handler = middlewareComponent.getClassHandler();
    let methodName: string = (preRequest) ? "onPreRequest" : "onPostRequest";

    let methodArgs: DI.ArgumentValue[] = await DI.methodArgumentResolver(handler, methodName, {
        request: context.request,
        response: context.response,
        params: context.params,
        cookies: context.cookies,
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