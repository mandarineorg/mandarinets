import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class MainCoreDecoratorProxy {

    public static registerMandarinePoweredComponent(targetClass: any, componentType: Mandarine.MandarineCore.ComponentTypes, options: { [prop: string]: any }, methodIndex: number) {
        ComponentsRegistryUtil.registerComponent(targetClass, componentType, options, methodIndex);
        return;
    }

    public static valueDecorator(targetClass: any, configKey: string, propertyName: string) {
        try {
            let propertyObject = Mandarine.Global.getMandarineConfiguration();

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
                    
                    targetClass[propertyName] = propertyObject[last];
                } else {
                    targetClass[propertyName] = undefined;
                }
            } else {
                targetClass[propertyName] = propertyObject[configKey];
            }
        } catch(error) {
            targetClass[propertyName] = undefined;
        }
    }

}