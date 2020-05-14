import { ComponentRegistryContext } from "../components-registry/componentRegistryContext.ts";
import { ComponentTypes } from "../components-registry/componentTypes.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { FactoryStorageError } from "../../mvc-framework/core/exceptions/factoryStorageError.ts";
import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";

export class ComponentUtils {

    public static createControllerComponent(componentName: string, configuration: any, classHandler: any) {
        ComponentsRegistryUtil.registerComponent(componentName, classHandler, ComponentTypes.CONTROLLER, configuration, null);
    }

    public static assertControllerNotNull(classComponentName: string, controllerComponent: ControllerComponent) {
        if(controllerComponent == (null || undefined)) {
            throw new FactoryStorageError(FactoryStorageError.UNKNOWN_OBJECT, classComponentName);
        }
    }

}