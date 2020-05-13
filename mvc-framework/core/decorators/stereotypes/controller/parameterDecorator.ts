import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { InjectionTypes } from "../../../../../main-core/dependency-injection/injectionTypes.ts";

export const Param = (paramType: InjectionTypes, name?: string): Function => {
    return (target: Object, methodName: string, index: number) => {
        RoutingUtils.registerRoutingParam(paramType, target, methodName, index);
    };
};

export const RouteParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.ROUTE_PARAM, target, propertyName, index, name);
    };
};

export const QueryParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.QUERY_PARAM, target, propertyName, index, name);
    };
};

export const Request = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.REQUEST_PARAM, target, propertyName, index);
    };
};

export const Session = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.SESSION_PARAM, target, propertyName, index);
    };
};

export const ServerRequest = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.SERVER_REQUEST_PARAM, target, propertyName, index);
    };
};

export const Response = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.RESPONSE_PARAM, target, propertyName, index);
    };
};

export const Cookie = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.COOKIE_PARAM, target, propertyName, index);
    };
};

export const RequestBody = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        RoutingUtils.registerRoutingParam(InjectionTypes.REQUEST_BODY_PARAM, target, propertyName, index);
    };
};