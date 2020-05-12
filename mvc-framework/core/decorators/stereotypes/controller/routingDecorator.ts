import { RoutingOptions } from "../../../interfaces/routing/routingOptions.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { HttpMethods } from "../../../enums/http/httpMethods.ts";

export const GET = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.GET, object, methodName, options);
    };
}

export const POST = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.POST, object, methodName, options);
    };
}

export const PUT = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.PUT, object, methodName, options);
    };
}

export const HEAD = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.HEAD, object, methodName, options);
    };
}

export const DELETE = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.DELETE, object, methodName, options);
    };
}

export const PATCH = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.PATCH, object, methodName, options);
    };
}

export const OPTIONS = (route: string, options?: RoutingOptions): Function => {
    return (object: Object, methodName: string, propertyDesciptor: PropertyDescriptor) => {
        RoutingUtils.registerHttpAction(route, HttpMethods.OPTIONS, object, methodName, options);
    };
}