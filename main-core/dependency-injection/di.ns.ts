import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { Reflect } from "../reflectMetadata.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { RoutingUtils } from "../../mvc-framework/core/utils/mandarine/routingUtils.ts";
import { Request } from "https://deno.land/x/oak/request.ts";
import { HttpUtils } from "../utils/httpUtils.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { getCookies } from "https://deno.land/std@0.51.0/http/cookie.ts";
import { Cookies } from "https://deno.land/x/oak/cookies.ts";
import { ViewModel } from "../../mvc-framework/core/modules/view-engine/viewModel.ts";
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