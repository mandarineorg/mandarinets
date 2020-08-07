// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "../utils/commonUtils.ts";

export class MainCoreDecoratorProxy {

    public static registerMandarinePoweredComponent(targetClass: any, componentType: Mandarine.MandarineCore.ComponentTypes, options: { [prop: string]: any }, methodIndex: number) {
        ComponentsRegistryUtil.registerComponent(targetClass, componentType, options, methodIndex);
        return;
    }

    public static valueDecorator(targetClass: any, configKey: string, scope: Mandarine.MandarineCore.ValueScopes, propertyName: string) {
        try {
            let propertyObject;
            if(scope == Mandarine.MandarineCore.ValueScopes.CONFIGURATION) propertyObject = Mandarine.Global.getMandarineConfiguration();
            if(scope == Mandarine.MandarineCore.ValueScopes.ENVIRONMENTAL) propertyObject = Deno.env.toObject();

            if(configKey.includes('.')) {
                let parts = configKey.split('.');

                if (Array.isArray(parts)) {
                    let last = parts.pop();
                    let keyPropertiesLength = parts.length;
                    let propertiesStartingIndex = 1;

                    let currentProperty = parts[0];
            
                    while((propertyObject = propertyObject[currentProperty]) && propertiesStartingIndex < keyPropertiesLength) {
                        currentProperty = parts[propertiesStartingIndex];
                        propertiesStartingIndex++;
                    }
                    
                    targetClass[propertyName] = CommonUtils.parseToKnownType(propertyObject[last]);
                } else {
                    targetClass[propertyName] = undefined;
                }
            } else {
                targetClass[propertyName] = CommonUtils.parseToKnownType(propertyObject[configKey]);
            }
        } catch(error) {
            targetClass[propertyName] = undefined;
        }
    }

}