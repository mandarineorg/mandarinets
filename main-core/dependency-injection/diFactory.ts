import { Cookies } from "../../deps.ts";
import { ComponentsRegistry, Mandarine, ViewModel } from "../../mod.ts";
import { RoutingUtils } from "../../mvc-framework/core/utils/mandarine/routingUtils.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { HttpUtils } from "../utils/httpUtils.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { DI } from "./di.ns.ts";

export class DependencyInjectionFactory {

    /** 
     * Resolve dependencies from a component's constructor. This method will look for the requested dependencies in the DI Container at mandarine compile time.
     *
     */
    public constructorResolver<T>(componentSource: Mandarine.MandarineCore.ComponentRegistryContext, componentRegistry: Mandarine.MandarineCore.IComponentsRegistry): T {
        if(componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT ||
            componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY) return;

        let target: DI.Constructor<T> = componentSource.componentInstance.getClassHandler();

        const providers = Reflect.getMetadata('design:paramtypes', target);
        const args = providers.map((provider: DI.Constructor) => {
        let component: Mandarine.MandarineCore.ComponentRegistryContext = componentRegistry.getComponentByHandlerType(provider);
            if(component != (undefined || null)) {
                let isComponentManual = component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT; 
                let classHandler: any = (isComponentManual) ? component.componentInstance : component.componentInstance.getClassHandler();

                // It is never initialized when it gets here.
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
    public componentDependencyResolver(componentRegistry: ComponentsRegistry) {
        componentRegistry.getAllComponentNames().forEach((componentName) => {
            let component: Mandarine.MandarineCore.ComponentRegistryContext = componentRegistry.get(componentName);
    
            if(component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || component.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY) {
                return;
            }
    
            let componentClassHandler = component.componentInstance.getClassHandler();
    
            if(ReflectUtils.constructorHasParameters(componentClassHandler)) {
                component.componentInstance.setClassHandler(this.constructorResolver(component, componentRegistry));
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

    /** 
     * Resolves all the requested data by a HTTP Handler method.
     * This function is used when requests are received
     *
     */
    public async methodArgumentResolver(object: any, methodName: string, extraData: DI.ArgumentsResolverExtraData) {
        const args: Array<DI.ArgumentValue> = [];

        let componentMethodParams: Array<string> = ReflectUtils.getParamNames(object[methodName]);
    
        let methodAnnotationMetadata: Array<any> = Reflect.getMetadataKeys(object, methodName);
        let methodInjectableDependencies: Array<any> = methodAnnotationMetadata.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER`));
        if(methodInjectableDependencies == null) return args;
    
        let metadataValues: Array<DI.InjectionMetadataContext> = new Array<DI.InjectionMetadataContext>();
    
        methodInjectableDependencies.forEach((dependencyMetadataKey: string) => {
            let metadataValue: DI.InjectionMetadataContext = <DI.InjectionMetadataContext> Reflect.getMetadata(dependencyMetadataKey, object, methodName);
            metadataValues.push(metadataValue);
        });
    
        metadataValues = metadataValues.sort((a, b) => a.parameterIndex - b.parameterIndex);
    
        const queryParams = RoutingUtils.findQueryParams(extraData.request.url.toString());
        const requestCookies: Cookies = extraData.cookies;
    
        for(let i = 0; i < componentMethodParams.length; i++) {
            if(!metadataValues.some((injectionMetadata: DI.InjectionMetadataContext) => injectionMetadata.parameterIndex === i)) {
                args.push(undefined);
            } else {
                const param = metadataValues.find(injectionMetadata => injectionMetadata.parameterIndex === i);
                switch(param.injectionType) {
                    case DI.InjectionTypes.QUERY_PARAM:
                        if(queryParams) args.push(queryParams.get(param.parameterName));
                        else args.push(undefined);
                        break;
                    case DI.InjectionTypes.ROUTE_PARAM:
                        if(extraData.params) args.push(extraData.params[param.parameterName]);
                        else args.push(undefined);
                        break;
                    case DI.InjectionTypes.REQUEST_PARAM:
                        args.push(extraData.request);
                        break;
                    case DI.InjectionTypes.SESSION_PARAM:
                        args.push((<any> extraData.request).session)
                        break;
                    case DI.InjectionTypes.SERVER_REQUEST_PARAM:
                        args.push(extraData.request.serverRequest);
                    break;
                    case DI.InjectionTypes.REQUEST_BODY_PARAM:
                        args.push(await HttpUtils.parseBody(extraData.request));
                    break;
                    case DI.InjectionTypes.RESPONSE_PARAM:
                        args.push(extraData.response);
                        break;
                    case DI.InjectionTypes.COOKIE_PARAM:
                        if(requestCookies.get(param.parameterName)) args.push(requestCookies.get(param.parameterName));
                        else args.push(undefined);
                        break;
                    case DI.InjectionTypes.INJECTABLE_OBJECT:
                        let injectableComponent = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(param.parameterObjectToInject);

                        if(injectableComponent != (null || undefined)) {
                            args.push((injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) ? injectableComponent.componentInstance : injectableComponent.componentInstance.getClassHandler());
                        } else args.push(undefined);
                        
                        break;
                    case DI.InjectionTypes.TEMPLATE_MODEL_PARAM:
                        args.push(new ViewModel());
                        break;
                }
            }
        }
    
        if (args.length == 0) return null;
        return args;
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getDependency(instance: any) {
        let component = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(instance);
        if(component != (null || undefined)) return (component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) ? component.componentInstance : component.componentInstance.getClassHandler();
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getSeed(instance: any) {
        return this.getDependency(instance);
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getInjectable(instance: any) {
        return this.getDependency(instance);
    }
}