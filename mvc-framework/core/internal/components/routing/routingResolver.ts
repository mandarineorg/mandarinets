// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";
import { MandarineException } from "../../../../../main-core/exceptions/mandarineException.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { Optional } from "../../../../../plugins/optional.ts";
import type { ControllerComponent } from "./controllerContext.ts";

/**
 * Resolves the request made to an endpoint. 
 * This method works along with the DI container.
 */
export const requestResolver = (routingAction: Mandarine.MandarineMVC.Routing.RoutingAction) => {
    return (component: ControllerComponent) => {

    const handler: any = component.getClassHandler();
    const isMethodAsync = handler[routingAction.actionMethodName] instanceof Mandarine.AsyncFunction;
    
    const renderInformation: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData = Reflect.getMetadata(`${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE_RENDER}:${routingAction.actionMethodName}`, handler, routingAction.actionMethodName);
    const isRenderable: boolean = renderInformation != undefined;

    return async (context: Mandarine.Types.RequestContext) => {
            let methodArgs: DI.ArgumentValue[] | null = await DI.Factory.methodArgumentResolver(handler, routingAction.actionMethodName, context);

            // We dont use the variable handlerMethod because if we do it will loose the context and so the dependency injection will fail.
            // So if the method we are invoking uses dependents, the dispatcher will fail.
            // with that said we have to use nativaly the class and the method as if we are invoking the whole thing.
            let methodValue: any = undefined;
            if(isMethodAsync) {
                methodValue = (methodArgs == null) ? await handler[routingAction.actionMethodName]() : await handler[routingAction.actionMethodName](...methodArgs);
            } else {
                methodValue = (methodArgs == null) ? handler[routingAction.actionMethodName]() : handler[routingAction.actionMethodName](...methodArgs);
            }

            if(isRenderable) {
                context.response.body = Mandarine.MandarineMVC.TemplateEngine.RenderEngine.render(renderInformation, renderInformation.engine, (methodValue == (null || undefined)) ? {} : methodValue);
            } else {
                context.response.body = Optional.ofNullable(methodValue).orElseGet(undefined);
            }
        }
    }
};

/**
 * Resolves the middleware request made to an endpoint. 
 */
export const middlewareResolver = async (preRequest: boolean, middlewareComponent: Mandarine.Types.MiddlewareComponent, context: Mandarine.Types.RequestContext): Promise<boolean | undefined> => {

    let handler = middlewareComponent.getClassHandler();
    let methodName: string = (preRequest) ? "onPreRequest" : "onPostRequest";

    let methodArgs: DI.ArgumentValue[] | null = await DI.Factory.methodArgumentResolver(handler, methodName, context);

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