import { InjectionTypes } from "./injectionTypes.ts";
import { Reflect } from "../reflectMetadata.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { InjectionMetadataContext } from "./injectionMetadataContext.ts";
import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { ComponentExceptions } from "../exceptions/componentExceptions.ts";
import { ComponentMetadataContext } from "../components-registry/componentMetadataContext.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { getDependencyInstance } from "./getDependencyInstance.ts";

export class DependencyInjectionUtil {

    public static isObjectInjectable(object: any) {
        let metadataKeys = Reflect.getMetadataKeys(object);
        return metadataKeys.some(ComponentsRegistryUtil.isObjectComponent());
    }

    public static defineInjectionMetadata(injectionType: InjectionTypes, paramaterInjectableObject: any, target: any, propertyName: string, parameterIndex: number, specificParameterName?: string) {
        let isMethod: boolean = (parameterIndex != null);
        let parentClassName: string = ReflectUtils.getClassName(target);

        if(isMethod) {
            let methodParams: Array<string> = ReflectUtils.getParamNames(target[propertyName]);
            let parameterName: string = methodParams[parameterIndex];

            let varName: string = parameterName; // If it is a property we catch its name

            if(specificParameterName != (null || undefined)) varName = specificParameterName; // If the user specified an specific parameter name, then we use it.

            let injectionFieldType = "PARAMETER";

            let parameterDependencyInjectionMetadataName = `${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:${injectionFieldType}:${injectionType}:${varName}:${(parameterIndex == (null || undefined) ? 0 : parameterIndex)}`;

            let annotationContext: InjectionMetadataContext = {
                injectionFieldType: <"PARAMETER" | "FIELD"> injectionFieldType,
                injectionType: injectionType,
                parameterName: varName,
                parameterIndex: parameterIndex,
                parameterMethodName: propertyName,
                parameterObjectToInject: paramaterInjectableObject,
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

            if(DependencyInjectionUtil.isObjectInjectable(propertyType)) {

                let targetMetadataKey = Reflect.getMetadataKeys(propertyType).find(ComponentsRegistryUtil.isObjectComponent());
                let metadata = <ComponentMetadataContext> Reflect.getMetadata(targetMetadataKey, propertyType);

                if(!ApplicationContext.getInstance().getComponentsRegistry().exist(propertyType.name)) {
                    ApplicationContext.getInstance().getComponentsRegistry().register(propertyType.name, target, metadata.componentType, {});
                }

                let component = ApplicationContext.getInstance().getComponentsRegistry().get(propertyType.name);
                let componentInstance = component.componentInstance;
                target[propertyName] = getDependencyInstance(component.componentType, componentInstance);

            } else if(ApplicationContext.getInstance().getPredefinedInjectables().hasOwnProperty('get'+propertyType.name)) {
                target[propertyName] = ApplicationContext.getInstance().getPredefinedInjectables()[`get${propertyType.name}`];
            } else {
                throw new ComponentExceptions(ComponentExceptions.NON_VALID_INJECTABLE, propertyType.name);
            }
        }
    }
}