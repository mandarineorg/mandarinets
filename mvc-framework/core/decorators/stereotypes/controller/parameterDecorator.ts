import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";

export const Param = (paramType: DI.InjectionTypes, name?: string): Function => {
    return (target: Object, methodName: string, index: number) => {
        RoutingUtils.registerRoutingParam(paramType, target, methodName, index);
    };
};

export const RouteParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.ROUTE_PARAM, target, propertyName, index, name);
    };
};

export const QueryParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.QUERY_PARAM, target, propertyName, index, name);
    };
};

export const RequestParam = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.REQUEST_PARAM, target, propertyName, index);
    };
};

export const Session = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.SESSION_PARAM, target, propertyName, index);
    };
};

export const ServerRequestParam = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.SERVER_REQUEST_PARAM, target, propertyName, index);
    };
};

export const ResponseParam = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.RESPONSE_PARAM, target, propertyName, index);
    };
};

export const Cookie = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.COOKIE_PARAM, target, propertyName, index);
    };
};

export const RequestBody = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(DI.InjectionTypes.REQUEST_BODY_PARAM, target, propertyName, index);
    };
};