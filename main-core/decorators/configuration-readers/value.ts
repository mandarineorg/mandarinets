import { getMandarineConfiguration } from "../../configuration/getMandarineConfiguration.ts";

export const Value = (key: string): Function => {
    return (target: any, propertyName: string) => {
        let propertyObject = getMandarineConfiguration();

        let parts = key.split('.');

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
    }
};