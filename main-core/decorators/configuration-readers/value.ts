import { getMandarineConfiguration } from "../../configuration/getMandarineConfiguration.ts";
import { Reflect } from "../../reflectMetadata.ts";

/**
 * **Decorator**
 * Inject a value from the configuration file.
 *
 * `@Value('mandarine.server.host')`
 */
export const Value = (propertyKey: string): Function => {
    return (target: any, propertyName: string) => {
        try {
            let propertyObject = getMandarineConfiguration();

            if(propertyKey.includes('.')) {
                let parts = propertyKey.split('.');

                if (Array.isArray(parts)) {
                    let last = parts.pop();
                    let keyPropertiesLength = parts.length;
                    let propertiesStartingIndex = 1;

                    let currentProperty = parts[0];
            
                    while((propertyObject = propertyObject[currentProperty]) && propertiesStartingIndex < keyPropertiesLength) {
                        currentProperty = parts[propertiesStartingIndex];
                        propertiesStartingIndex++;
                    }
                    
                    target[propertyName] = propertyObject[last];
                } else {
                    target[propertyName] = undefined;
                }
            } else {
                target[propertyName] = propertyObject[propertyKey];
            }
        } catch(error) {
            target[propertyName] = undefined;
        }
    }
};