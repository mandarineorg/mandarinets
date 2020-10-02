// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type GET.
 * 
 * `@GET(route, options)
 *  Target: Method`
 */
export const GET = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.GET, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type POST.
 * 
 * `@POST(route, options)
 *  Target: Method`
 */
export const POST = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.POST, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type PUT.
 * 
 * `@PUT(route, options)
 *  Target: Method`
 */
export const PUT = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PUT, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type HEAD.
 * 
 * `@HEAD(route, options)
 *  Target: Method`
 */
export const HEAD = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.HEAD, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type DELETE.
 * 
 * `@DELETE(route, options)
 *  Target: Method`
 */
export const DELETE = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.DELETE, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type PATCH.
 * 
 * `@PATCH(route, options)
 *  Target: Method`
 */
export const PATCH = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PATCH, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}

/**
 * **Decorator**
 * 
 * Defines an HTTP Handler of type OPTIONS.
 * 
 * `@OPTIONS(route, options)
 *  Target: Method`
 */
export const OPTIONS = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        MVCDecoratorsProxy.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.OPTIONS, object, methodName, <Mandarine.MandarineMVC.Routing.RoutingOptions> options);
    };
}