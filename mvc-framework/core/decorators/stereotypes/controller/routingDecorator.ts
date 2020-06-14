import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";

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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.GET, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.POST, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PUT, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.HEAD, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.DELETE, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PATCH, object, methodName, options);
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
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.OPTIONS, object, methodName, options);
    };
}