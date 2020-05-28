import { Reflect } from "../reflectMetadata.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { DI } from "./di.ns.ts";

/**
 * Contains all the util methods that are related to the DI built-in framework.
 */
export class DependencyInjectionUtil {

    /**
     * Defines the context for a new injection inside the DI system
     */
    public static defineInjectionMetadata(injectionType: DI.InjectionTypes, target: any, propertyName: string, parameterIndex: number, specificParameterName?: string) {
        let isMethod: boolean = (parameterIndex != null);
        let parentClassName: string = ReflectUtils.getClassName(target);

        if(isMethod) {
            let methodArgumentTypes = Reflect.getMetadata("design:paramtypes", target, propertyName);

            let methodParams: Array<string> = ReflectUtils.getParamNames(target[propertyName]);
            let parameterName: string = methodParams[parameterIndex];

            let varName: string = parameterName; // If it is a property we catch its name

            if(specificParameterName != (null || undefined)) varName = specificParameterName; // If the user specified an specific parameter name, then we use it.

            let parameterDependencyInjectionMetadataName = `${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER:${injectionType}:${varName}:${(parameterIndex == (null || undefined) ? 0 : parameterIndex)}`;

            let annotationContext: DI.InjectionMetadataContext = {
                injectionType: injectionType,
                parameterName: varName,
                parameterIndex: parameterIndex,
                parameterMethodName: propertyName,
                parameterObjectToInject: (injectionType == DI.InjectionTypes.INJECTABLE_OBJECT) ? methodArgumentTypes[parameterIndex] : undefined,
                propertyName: undefined,
                propertyObjectToInject: undefined,
                className: parentClassName
            };

            let metadataKeys: Array<any> = (isMethod) ? Reflect.getMetadataKeys(target, propertyName) : Reflect.getMetadataKeys(target);

            if(metadataKeys != null) {
                if(metadataKeys.some(metadataKey => metadataKey == parameterDependencyInjectionMetadataName)) {
                    return;
                }
            }

            Reflect.defineMetadata(parameterDependencyInjectionMetadataName, annotationContext, target, propertyName);

        } else {
            let propertyType = Reflect.getMetadata("design:type", target, propertyName);
            
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_INJECTABLE_FIELD}:${propertyName}`, {
                propertyType: propertyType,
                propertyTypeName: propertyType.name,
                propertyName: propertyName
            }, target);
        }
    }
}