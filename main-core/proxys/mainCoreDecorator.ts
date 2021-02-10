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

    public static configurationPropertiesDecorator(targetClass: any, path: string) {
        Reflect.defineMetadata(MandarineConstants.REFLECTION_MANDARINE_CONFIGURATION_PROPERTIES, path, targetClass);
        const target = targetClass.prototype || targetClass;
        const valueDecoratorMetadataKeys = Reflect.getMetadataKeys(target) || [];
        valueDecoratorMetadataKeys.forEach((key) => {
            const metadata: { configKey: string, scope: string, propertyName: string } = Reflect.getMetadata(key, target);
            this.valueDecorator(target, metadata.configKey, undefined, metadata.propertyName, JsonUtils.toJson(path, { isFile: true, allowEnvironmentalReferences: true, handleException: (ex) => {
                Mandarine.logger.warn(`Something happened while reading custom configuration file for @Value. ${ex} (${path})`);
                return {}
            } }));
            
        });
    }

    public static valueDecorator(targetClass: any, configKey: string, scope: Mandarine.MandarineCore.ValueScopes | undefined, propertyName: string, propertyObject?: any) {
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_VALUE_DECORATOR}-${CommonUtils.generateUUID()}`, {
            configKey,
            scope,
            propertyName
        }, targetClass);

        if(propertyObject === undefined) {
            if(scope == Mandarine.MandarineCore.ValueScopes.CONFIGURATION) propertyObject = Mandarine.Global.getMandarineConfiguration();
            if(scope == Mandarine.MandarineCore.ValueScopes.ENVIRONMENTAL) propertyObject = Deno.env.toObject();
        }

        targetClass[propertyName] = IndependentUtils.readConfigByDots(propertyObject, configKey);
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

}