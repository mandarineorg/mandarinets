import { ReflectUtils } from "../utils/reflectUtils.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ComponentExceptions } from "../exceptions/componentExceptions.ts";
import { InvalidAnnotationError } from "../exceptions/invalidAnnotationError.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class ComponentsRegistryUtil {

    public static registerComponent(componentName: string, componentTarget: any, componentType: Mandarine.MandarineCore.ComponentTypes, configuration: any, index: number): any {
        if((index != null)) throw new InvalidAnnotationError(InvalidAnnotationError.CLASS_ONLY_ANNOTATION, Mandarine.MandarineCore.ComponentTypes[componentType]);
        
        let parentClassName: string = ReflectUtils.getClassName(componentTarget);
        if(componentName == (undefined || null)) componentName = parentClassName;

        let componentsRegistry = ApplicationContext.getInstance().getComponentsRegistry();

        if(componentsRegistry.exist(componentName)) {
            throw new ComponentExceptions(ComponentExceptions.EXISTENT_COMPONENT, componentName);
        } else {
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:${Mandarine.MandarineCore.ComponentTypes[componentType].toLowerCase()}:${componentName}`, {
                componentName: componentName,
                componentConfiguration: configuration,
                componentType: componentType,
                componentInstance: componentTarget,
                classParentName: parentClassName
            }, componentTarget);

            componentsRegistry.register(componentName, componentTarget, componentType, configuration);
        }
    }
}