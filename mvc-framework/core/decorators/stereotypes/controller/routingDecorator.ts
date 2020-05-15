import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const GET = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.GET, object, methodName, options);
    };
}

export const POST = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.POST, object, methodName, options);
    };
}

export const PUT = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PUT, object, methodName, options);
    };
}

export const HEAD = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.HEAD, object, methodName, options);
    };
}

export const DELETE = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.DELETE, object, methodName, options);
    };
}

export const PATCH = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.PATCH, object, methodName, options);
    };
}

export const OPTIONS = (route: string, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, Mandarine.MandarineMVC.HttpMethods.OPTIONS, object, methodName, options);
    };
}