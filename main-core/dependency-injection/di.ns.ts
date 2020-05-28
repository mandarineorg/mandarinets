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
     * Resolve dependencies from a component's constructor. This method will look for the requested dependencies in the DI Container at mandarine compile time.
     *
     */
    export function constructorResolver<T>(componentSource: Mandarine.MandarineCore.ComponentRegistryContext, componentRegistry: Mandarine.MandarineCore.IComponentsRegistry): T {
        if(componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT ||
            componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY) return;

        let target: Constructor<T> = componentSource.componentInstance.getClassHandler();

        const providers = Reflect.getMetadata('design:paramtypes', target);
        const args = providers.map((provider: Constructor) => {
        let component: Mandarine.MandarineCore.ComponentRegistryContext = componentRegistry.getComponentByHandlerType(provider);
            if(component != (undefined || null)) {
                let isComponentManual = component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT; 
                let classHandler: any = (isComponentManual) ? component.componentInstance : component.componentInstance.getClassHandler();

                return (isComponentManual || ReflectUtils.checkClassInitialized(classHandler)) ? classHandler : new classHandler();
            } else {
                return undefined;
            }
        });

        return new target(...args);
    }

    /** 
     * Resolves all the dependencies a component has (Fields and constructor). 
     * **Note** MANUAL_COMPONENTS are not resolved since they were theorically resolved by the user.
     *
     */
    export function componentDependencyResolver(componentRegistry: ComponentsRegistry) {
        componentRegistry.getAllComponentNames().forEach((componentName) => {
            let component: Mandarine.MandarineCore.ComponentRegistryContext = componentRegistry.get(componentName);
    
            if(component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || component.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY) {
                return;
            }
    
            let componentClassHandler = component.componentInstance.getClassHandler();
    
            if(ReflectUtils.constructorHasParameters(componentClassHandler)) {
                component.componentInstance.setClassHandler(constructorResolver(component, componentRegistry));
            } else {
                component.componentInstance.setClassHandler(new componentClassHandler());
            }
    
            let componentHandler: any = component.componentInstance.getClassHandler();
    
            let reflectMetadataInjectionKeys = Reflect.getMetadataKeys(componentHandler);
            if(reflectMetadataInjectionKeys != (undefined || null)) {
                reflectMetadataInjectionKeys = reflectMetadataInjectionKeys.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_INJECTABLE_FIELD}:`));
                if(reflectMetadataInjectionKeys != (undefined || null)) {
                    (<Array<string>>reflectMetadataInjectionKeys).forEach((metadataKey) => {
                        let metadata: {propertyType: any, propertyName: string, propertyTypeName: string} = Reflect.getMetadata(metadataKey, componentHandler);
                        let injectableComponent: any = componentRegistry.getComponentByHandlerType(metadata.propertyType);
                        if(injectableComponent != (null || undefined)) {
                            let injectableHandler = (injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) ? injectableComponent.componentInstance : injectableComponent.componentInstance.getClassHandler();
                            componentHandler[metadata.propertyName] = injectableHandler;
                        }
                    });
                }
            }
        });
    }

    export function getDependencyInstance(componentType: Mandarine.MandarineCore.ComponentTypes, componentInstance: any): any {
        switch(componentType) {
            case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                return (<ControllerComponent> componentInstance).getClassHandler();
            case Mandarine.MandarineCore.ComponentTypes.SERVICE:
                return (<ServiceComponent> componentInstance).getClassHandler();
            case Mandarine.MandarineCore.ComponentTypes.CONFIGURATION:
                return (<ConfigurationComponent> componentInstance).getClassHandler();
            case Mandarine.MandarineCore.ComponentTypes.COMPONENT:
                return (<ComponentComponent> componentInstance).getClassHandler();
        }
        return null;
    }
    
    /** 
     * Resolves all the requested data by a HTTP Handler method.
     * This function is used when requests are received
     *
     */
    export async function methodArgumentResolver(object: any, methodName: string, extraData: ArgumentsResolverExtraData) {
        const args: Array<ArgumentValue> = [];

        let componentMethodParams: Array<string> = ReflectUtils.getParamNames(object[methodName]);
    
        let methodAnnotationMetadata: Array<any> = Reflect.getMetadataKeys(object, methodName);
        let methodInjectableDependencies: Array<any> = methodAnnotationMetadata.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER`));
        if(methodInjectableDependencies == null) return args;
    
        let metadataValues: Array<InjectionMetadataContext> = new Array<InjectionMetadataContext>();
    
        methodInjectableDependencies.forEach((dependencyMetadataKey: string) => {
            let metadataValue: InjectionMetadataContext = <InjectionMetadataContext> Reflect.getMetadata(dependencyMetadataKey, object, methodName);
            metadataValues.push(metadataValue);
        });
    
        metadataValues = metadataValues.sort((a, b) => a.parameterIndex - b.parameterIndex);
    
        const queryParams = RoutingUtils.findQueryParams(extraData.request.url.toString());
        const requestCookies: Cookies = extraData.cookies;
    
        for(let i = 0; i < componentMethodParams.length; i++) {
            if(!metadataValues.some((injectionMetadata: InjectionMetadataContext) => injectionMetadata.parameterIndex === i)) {
                args.push(undefined);
            } else {
                const param = metadataValues.find(injectionMetadata => injectionMetadata.parameterIndex === i);
                switch(param.injectionType) {
                    case InjectionTypes.QUERY_PARAM:
                        if(queryParams) args.push(queryParams.get(param.parameterName));
                        else args.push(undefined);
                        break;
                    case InjectionTypes.ROUTE_PARAM:
                        if(extraData.params) args.push(extraData.params[param.parameterName]);
                        else args.push(undefined);
                        break;
                    case InjectionTypes.REQUEST_PARAM:
                        args.push(extraData.request);
                        break;
                    case InjectionTypes.SESSION_PARAM:
                        args.push((<any> extraData.request).session)
                        break;
                    case InjectionTypes.SERVER_REQUEST_PARAM:
                        args.push(extraData.request.serverRequest);
                    break;
                    case InjectionTypes.REQUEST_BODY_PARAM:
                        args.push(await HttpUtils.parseBody(extraData.request));
                    break;
                    case InjectionTypes.RESPONSE_PARAM:
                        args.push(extraData.response);
                        break;
                    case InjectionTypes.COOKIE_PARAM:
                        if(requestCookies.get(param.parameterName)) args.push(requestCookies.get(param.parameterName));
                        else args.push(undefined);
                        break;
                    case InjectionTypes.INJECTABLE_OBJECT:
                        let injectableComponent = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(param.parameterObjectToInject);

                        if(injectableComponent != (null || undefined)) {
                            args.push((injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) ? injectableComponent.componentInstance : injectableComponent.componentInstance.getClassHandler());
                        } else args.push(undefined);
                        
                        break;
                    case InjectionTypes.TEMPLATE_MODEL_PARAM:
                        args.push(new ViewModel());
                        break;
                }
            }
        }
    
        if (args.length == 0) return null;
        return args;
    }
}