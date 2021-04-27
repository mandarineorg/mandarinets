// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { DI } from "../../../../../main-core/dependency-injection/di.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

/**
 * **Decorator**
 * 
 * Defines a injection for a parameter in a HTTP handler, manually.
 * This is not recommended since you have to manually specify what type of injection you are looking for.
 * Instead, use decorators for each injection type.
 * 
 * `@Param(paramType, name)
 *  Target: Method parameter`
 */
export const Param = (paramType: DI.InjectionTypes): Function => {
    return (target: Object, methodName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, paramType, methodName, index);
    };
};

/**
 * **Decorator**
 * 
 * Injects the value from a request that has a route param.
 * 
 * `@RouteParam(name?)
 *  Target: Method parameter`
 * 
 *  **name** should be equal to the route param key, ex. /user/:id => @RouteParam('id')
 *  If **name** is ignored, it will take the parameter's name as the value
 */
export const RouteParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.ROUTE_PARAM, propertyName, index, name);
    };
};

/**
 * **Decorator**
 * 
 * Injects the value from the query parameters of a request.
 * 
 * `@QueryParam(name?)
 *  Target: Method parameter`
 * 
 *  **name** should be equal to the route param key, ex. /getUser?id=123 => @QueryParam('id')
 *  If **name** is ignored, it will take the parameter's name as the value
 */
export const QueryParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.QUERY_PARAM, propertyName, index, name);
    };
};

/**
 * **Decorator**
 * 
 * Injects the request object from a request
 * 
 * `@RequestParam()
 *  Target: Method parameter`
 */
export const RequestParam = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.REQUEST_PARAM, propertyName, index);
    };
};

/**
 * **Decorator**
 * 
 * Injects the whole context of the request
 * 
 * `@RequestContext()
 *  Target: Method parameter`
 */
export const RequestContext = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.REQUEST_CONTEXT_PARAM, propertyName, index);
    };
};


/**
 * **Decorator**
 * 
 * Injects the session object from a request.
 * Modifications to the session will be automatically saved when the request finishes.
 * 
 * `@Session()
 *  Target: Method parameter`
 */
export const Session = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.SESSION_PARAM, propertyName, index);
    };
};

/**
 * **Decorator**
 * 
 * Injects the response object from a request.
 * 
 * `@ResponseParam()
 *  Target: Method parameter`
 */
export const ResponseParam = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.RESPONSE_PARAM, propertyName, index);
    };
};

/**
 * **Decorator**
 * 
 * Injects a cookie from a request
 * 
 * `@CookieParam(name)
 *  Target: Method parameter`
 * 
 * **name** should be equal to the cookie's name that is wanted. If ignored, the parameter's name will be taken as the cookie's name
 */
export const CookieParam = (name?: string): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.COOKIE_PARAM, propertyName, index, name);
    };
};

/**
 * **Decorator**
 * 
 * Gets the value from the body of a request. 
 * Mandarine will try to parse this value.
 * If its content type is application/json or application/x-www-form-urlencoded, it will be parsed to a javascript object
 * If its type is unknown, it will return an Uint8Array with the content of the body.
 * 
 * `@RequestBody(name)
 *  Target: Method parameter`
 */
export const RequestBody = (): Function => {
    return (target: Object, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.REQUEST_BODY_PARAM, propertyName, index);
    };
};


/**
 * **Decorator**
 * 
 * Gets a modeler for a template. By using the built-in modeler, it is easier to work with templates & the variable it will have.
 * 
 * `@Model()
 *  Target: Method parameter`
 */

 export const Model = (): Function => {
     return (target: any, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.TEMPLATE_MODEL_PARAM, propertyName, index);
     }
 }

 /**
 * **Decorator**
 * 
 * Gets all the parameters (query & route) present in the current request.
 * 
 * `@Parameters()
 *  Target: Method parameter`
 * 
 * @returns an object of Mandarine.MandarineMVC.AllParameters
 */
export const Parameters = (): Function => {
    return (target: any, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.PARAMETERS_PARAM, propertyName, index);
    }
}

 /**
 * **Decorator**
 * 
 * Injects the principal (user data) of the current authorized user in the request
 * 
 * `@AuthPrincipal()
 *  Target: Method parameter`
 * 
 * @returns an object (which contains Mandarine.Security.Auth.UserDetails) with the user data.
 */
export const AuthPrincipal = (): Function => {
    return (target: any, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerRoutingParam(target, DI.InjectionTypes.AUTH_PRINCIPAL_PARAM, propertyName, index);
    }
}