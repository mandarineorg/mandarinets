// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Cookies } from "../../deps.ts";
import { ComponentsRegistry, Mandarine, ViewModel } from "../../mod.ts";
import { RoutingUtils } from "../../mvc-framework/core/utils/mandarine/routingUtils.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { HttpUtils } from "../utils/httpUtils.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { DI } from "./di.ns.ts";
import { getPipes } from "./internals/getPipes.ts";
import { executePipe } from "../internals/methods/executePipe.ts";
import { DependencyInjectionUtil } from "./di.util.ts";
import { MandarineMVCUtils } from "../../mvc-framework/core/utils/mvc.utils.ts";
import type { ClassType } from "../utils/utilTypes.ts";

export class DependencyInjectionFactory {

    /** 
     * Resolve dependencies from a component's constructor. This method will look for the requested dependencies in the DI Container at mandarine compile time.
     *
     */
    public constructorResolver<T>(componentSource: Mandarine.MandarineCore.ComponentRegistryContext, componentRegistry: Mandarine.MandarineCore.IComponentsRegistry): T | undefined{
        if(componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT ||
            componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY
                || componentSource.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL) return;

        let target: DI.Constructor<T> = componentSource.componentInstance.getClassHandler();

        const providers = Reflect.getMetadata('design:paramtypes', target);
        const args = providers.map((provider: DI.Constructor) => {
        let component: Mandarine.MandarineCore.ComponentRegistryContext | undefined = componentRegistry.getComponentByHandlerType(provider);
            if(component != (undefined || null)) {
                let isComponentManual = component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT; 
                let isComponentInternal = component.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL; 
                let classHandler: any = (isComponentManual || isComponentInternal) ? component.componentInstance : component.componentInstance.getClassHandler();

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
        // Initialize all components

        const ignoreComponentIf = (component: Mandarine.MandarineCore.ComponentRegistryContext): boolean => component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || component.componentType == Mandarine.MandarineCore.ComponentTypes.REPOSITORY || component.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL;

        componentRegistry.getAllComponentNames().forEach((componentName) => {
            let component: Mandarine.MandarineCore.ComponentRegistryContext | undefined = componentRegistry.get(componentName);
    
            if(component) {
                if(ignoreComponentIf(component)) {
                    return;
                }
        
                let componentClassHandler = component.componentInstance.getClassHandler();
        
                if(ReflectUtils.constructorHasParameters(componentClassHandler)) {
                    component.componentInstance.setClassHandler(this.constructorResolver(component, componentRegistry));
                } else {
                    component.componentInstance.setClassHandler(new componentClassHandler());
                }
            }
        });
        
        // Initialize manual injections after components have been initialized
        componentRegistry.getAllComponentNames().forEach((componentName) => {
            let component: Mandarine.MandarineCore.ComponentRegistryContext | undefined = componentRegistry.get(componentName);
            if(component) {
                if(ignoreComponentIf(component)) {
                    return;
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
                                let injectableHandler = (injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL) ? injectableComponent.componentInstance : injectableComponent.componentInstance.getClassHandler();
                                componentHandler[metadata.propertyName] = injectableHandler;
                            }
                        });
                    }
                }
            }
        })
    }

    /** 
     * Resolves all the requested data by a HTTP Handler method.
     * This function is used when requests are received
     *
     */
    public async methodArgumentResolver(object: any, methodName: string, context: Mandarine.Types.RequestContext) {
        const args: Array<DI.ArgumentValue> = [];

        const { componentMethodParams, metadataValues, queryParams, routeParams, requestCookies } = <any> DependencyInjectionUtil.getDIHandlerContext(object, methodName, context);
    
        for(let i = 0; i < componentMethodParams.length; i++) {
            const pipes: Array<any> | any = getPipes(object, i, methodName);
            if(!metadataValues.some((injectionMetadata: DI.InjectionMetadataContext) => injectionMetadata.parameterIndex === i)) {
                args.push(undefined);
            } else {
                const param = metadataValues.find((injectionMetadata: any) => injectionMetadata.parameterIndex === i);
                
                let valueToInject: any = undefined;
                switch(param.injectionType) {
                    case DI.InjectionTypes.QUERY_PARAM:
                        if(queryParams) {
                            valueToInject = queryParams.get(param.parameterName);
                        }
                        break;
                    case DI.InjectionTypes.ROUTE_PARAM:
                        if(routeParams) {
                            valueToInject = routeParams[param.parameterName];
                        }
                        break;
                    case DI.InjectionTypes.REQUEST_PARAM:
                        valueToInject = context.request;
                        break;
                    case DI.InjectionTypes.SESSION_PARAM:
                        valueToInject = context.request.session;
                        break;
                    case DI.InjectionTypes.SERVER_REQUEST_PARAM:
                        valueToInject = context.request;
                    break;
                    case DI.InjectionTypes.REQUEST_BODY_PARAM:
                        valueToInject = await HttpUtils.parseBody(context.request);
                    break;
                    case DI.InjectionTypes.RESPONSE_PARAM:
                        valueToInject = context.response;
                        break;
                    case DI.InjectionTypes.COOKIE_PARAM:
                        if(requestCookies.get(param.parameterName)) {
                            valueToInject = requestCookies.get(param.parameterName);
                        }
                        break;
                    case DI.InjectionTypes.INJECTABLE_OBJECT:
                        let injectableComponent = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(param.parameterObjectToInject);

                        if(injectableComponent != (null || undefined)) {
                            valueToInject = (injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || injectableComponent.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL) ? injectableComponent.componentInstance : injectableComponent.componentInstance.getClassHandler();
                        }
                        
                        break;
                    case DI.InjectionTypes.TEMPLATE_MODEL_PARAM:
                        valueToInject = new ViewModel();
                        break;
                    case DI.InjectionTypes.PARAMETERS_PARAM:
                        const allParameters: Mandarine.MandarineMVC.AllParameters = { 
                            query: Object.fromEntries(queryParams), 
                            route: routeParams
                        };
                        valueToInject = allParameters;
                        break;
                    case DI.InjectionTypes.REQUEST_CONTEXT_PARAM:
                        valueToInject = context;
                        break;
                    case DI.InjectionTypes.AUTH_PRINCIPAL_PARAM:
                        valueToInject = context.request.authentication?.AUTH_PRINCIPAL;
                        break;
                    case DI.InjectionTypes.CUSTOM_DECORATOR_PARAM:
                        const executerProvider = (<Mandarine.MandarineMVC.DecoratorFactoryData<any, any>>param.parameterConfiguration)?.provider;
                        const parameterData = (<Mandarine.MandarineMVC.DecoratorFactoryData<any, any>>param.parameterConfiguration)?.paramData;
                        const providerExecution = executerProvider(MandarineMVCUtils.buildRequestContextAccessor(context), ...parameterData);
                        valueToInject = providerExecution;
                        break;
                }

                if(pipes) {
                    if(Array.isArray(pipes)) {
                        pipes.forEach((pipe) => {
                            valueToInject = executePipe(pipe, valueToInject);
                        })
                    } else {
                        valueToInject = executePipe(pipes, valueToInject);
                    }
                }

                args.push(valueToInject);
            }
        }
    
        if (args.length == 0) return null;
        return args;
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getDependency<T = any>(type: ClassType): T | undefined {
        let component = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(type);
        if(component != (null || undefined)) return (component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || component.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL) ? component.componentInstance : component.componentInstance.getClassHandler();
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getSeed<T = any>(type: ClassType): T | undefined {
        return this.getDependency(type);
    }

    /** 
     * Get a Dependency from the DI Container programatically
     */
    public getInjectable<T = any>(type: ClassType) : T | undefined {
        return this.getDependency(type);
    }

    /**
     * Get component of dependency by Type
     */
    public getComponentByType(type: any) {
        let component = ApplicationContext.getInstance().getComponentsRegistry().getComponentByHandlerType(type);
        if(component != (null || undefined) && component.componentType !== Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT && component.componentType !== Mandarine.MandarineCore.ComponentTypes.INTERNAL) {
            return component.componentInstance;
        }
    }

    /**
     * Get component of dependency by component type
     */
    public getComponentsByComponentType<T>(type: Mandarine.MandarineCore.ComponentTypes): Array<T> {
        return ApplicationContext.getInstance().getComponentsRegistry().getComponentsByComponentType(type).map((item: any) => item.componentInstance);
    }
}