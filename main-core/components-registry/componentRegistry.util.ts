import { ComponentTypes } from "./componentTypes.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ComponentExceptions } from "../exceptions/componentExceptions.ts";
import { InvalidAnnotationError } from "../exceptions/invalidAnnotationError.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";

export class ComponentsRegistryUtil {

    public static isObjectComponent() {
        return (metadataKey: string) => (metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:service:`) || 
                                                                   metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:controller:`) || 
                                                                   metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:configuration:`) ||
                                                                   metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:component:`));
    }

    public static registerComponent(componentName: string, componentTarget: any, componentType: ComponentTypes, configuration: any, index: number): any {
        if((index != null)) throw new InvalidAnnotationError(InvalidAnnotationError.CLASS_ONLY_ANNOTATION, ComponentTypes[componentType]);
        
        let parentClassName: string = ReflectUtils.getClassName(componentTarget);
        if(componentName == (undefined || null)) componentName = parentClassName;

        if(ApplicationContext.getInstance().getComponentsRegistry().exist(componentName)) {
            throw new ComponentExceptions(ComponentExceptions.EXISTENT_COMPONENT, componentName);
        } else {
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:${ComponentTypes[componentType].toLowerCase()}:${componentName}`, {
                componentName: componentName,
                componentConfiguration: configuration,
                componentType: componentType,
                componentInstance: componentTarget,
                classParentName: parentClassName
            }, componentTarget);

            ApplicationContext.getInstance().getComponentsRegistry().register(componentName, componentTarget, componentType, configuration);
        }

        // let componentInstanceInitialized: any = undefined;
        // switch(componentType) {
        //     case ComponentTypes.CONTROLLER:
        //         let ctrlContext: ControllerComponent = new ControllerComponent(componentName, configuration.pathRoute, componentTarget);
        //         componentInstanceInitialized = ctrlContext;
        //     break;
        // }

        // getComponentsRegistry().register(componentName, componentInstanceInitialized, componentType);
    }
}