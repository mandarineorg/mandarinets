import { Cookies, Request } from "../../deps.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { DependencyInjectionFactory } from "./diFactory.ts";

export namespace DI {

    /** 
     * Interprets the arguments to return after injection
     *
     */
    export type ArgumentValue = any;

    /** 
     * Infer the arguments of constructor for dependency injection.
     *
     */
    export type Constructor<T = any> = new (...args: any[]) => T;

    /** 
     * Structure of data for requests in order to resolve dependencies.
     *
     */
    export interface ArgumentsResolverExtraData {
        request: Request;
        response: any;
        params: any;
        cookies: Cookies;
        routingAction: Mandarine.MandarineMVC.Routing.RoutingAction;
    }

    /** 
     * Structure of injections in methods' arguments.
     *
     */
    export interface InjectionMetadataContext {
        injectionType: InjectionTypes;
        parameterName: string;
        parameterIndex: number;
        parameterMethodName: string;
        parameterObjectToInject?: any;
    
        propertyName: string;
        propertyObjectToInject?: any;
    
        className: string;
    }

    /** 
     * List of all the possible injection types.
     * **NOTE** INJECTABLE_OBJECT refers to a injection that is not part of Mandarine Components but it has been defined as a component by the user.
     *
     */
    export enum InjectionTypes {
        INJECTABLE_OBJECT,
        QUERY_PARAM,
        ROUTE_PARAM,
        SERVER_REQUEST_PARAM,
        REQUEST_PARAM,
        SESSION_PARAM,
        REQUEST_BODY_PARAM,
        RESPONSE_PARAM,
        COOKIE_PARAM,
        TEMPLATE_MODEL_PARAM
    }

    /**
     * Includes the instance of DependencyInjectionFactory
     */
    export class FactoryClass extends DependencyInjectionFactory {}

    /**
     * Initializes the DI factory.
     */
    export const Factory = new FactoryClass();
}