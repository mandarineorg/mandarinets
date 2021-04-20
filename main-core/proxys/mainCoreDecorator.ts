// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "../utils/commonUtils.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import { Reflect } from "../reflectMetadata.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { JsonUtils } from "../utils/jsonUtils.ts";
import { IndependentUtils } from "../utils/independentUtils.ts";

/**
 * Logic behind decorators of Mandarine's core
 */
export class MainCoreDecoratorProxy {

    public static registerMandarinePoweredComponent(targetClass: any, componentType: Mandarine.MandarineCore.ComponentTypes, options: { [prop: string]: any }, methodIndex: number | null) {
        ComponentsRegistryUtil.registerComponent(targetClass, componentType, options, methodIndex);
        return;
    }

    public static registerEventListener(targetClass: any, eventName: string, methodName: string) {
        const metadata: Mandarine.MandarineCore.Decorators.EventListener = {
            methodName: methodName,
            eventName: eventName
        };

        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_EVENTLISTENER_DECORATOR}:${methodName}`, metadata, targetClass);
    }

    public static registerWebsocketProperty(targetClass: any, eventName: Mandarine.MandarineCore.Decorators.WebSocketValidProperties, methodName: string) {
        const metadata: Mandarine.MandarineCore.Decorators.WebSocketProperty  = {
            methodName: methodName,
            property: eventName
        };

        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_WEBSOCKET_PROPERTY}:${methodName}`, metadata, targetClass);
    }

    public static configurationPropertiesDecorator(targetClass: any, path: string) {
        Reflect.defineMetadata(MandarineConstants.REFLECTION_MANDARINE_CONFIGURATION_PROPERTIES, path, targetClass.prototype);
    }

    public static valueDecorator(targetClass: any, configKey: string, scope: Mandarine.MandarineCore.ValueScopes | undefined, propertyName: string, propertyObject?: any) {
        const metadata: Mandarine.MandarineCore.Decorators.Value = {
            configKey,
            scope,
            propertyName
        };
        
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_VALUE_DECORATOR}-${CommonUtils.generateUUID()}`, metadata, targetClass);

        if(propertyObject) {
            targetClass[propertyName] = IndependentUtils.readConfigByDots(propertyObject, configKey);
        }
    }

    public static overrideNativeComponent(targetClass: any, overrideType: Mandarine.MandarineCore.NativeComponents) {
        const className = ReflectUtils.getClassName(targetClass);

        if(overrideType === undefined) {
            switch(className) {
                case "WebMvcConfigurer":
                    overrideType = Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer;
                break;

                default:
                    throw new MandarineException(MandarineException.UNKNOWN_OVERRIDEN.replace("%s", className));
                break;
            }
        }

        Mandarine.Global.getNativeComponentsRegistry().override(overrideType, new targetClass());
    }

    public static registerScheduledTask(targetClass: any, cronExpression: string, timeZone: string | undefined, methodName: string): void {
        const metadata: Mandarine.MandarineCore.Decorators.ScheduledTask = {
            methodName,
            cronExpression,
            timeZone
        };

        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_SCHEDULED_DECORATOR}-${CommonUtils.generateUUID()}`, metadata, targetClass);
    }

    public static registerTimer(targetClass: any, fixedRate: number, methodName: string): void {
        const metadata: Mandarine.MandarineCore.Decorators.Timer = {
            methodName,
            fixedRate
        };

        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_TIMER_DECORATOR}-${CommonUtils.generateUUID()}`, metadata, targetClass);
    }
    
    public static registerWorkerProperty(targetClass: any, eventName: Mandarine.MandarineCore.Decorators.MicroserviceWorkerProperties, methodName: string) {
        const metadata: Mandarine.MandarineCore.Decorators.MicroserviceProperty  = {
            methodName: methodName,
            property: eventName
        };

        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_MICROSERVICE_PROPERTY}:${methodName}`, metadata, targetClass);
    }
}