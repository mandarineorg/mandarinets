import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class ComponentUtils {

    public static createControllerComponent(componentName: string, configuration: any, classHandler: any) {
        ComponentsRegistryUtil.registerComponent(componentName, classHandler, Mandarine.MandarineCore.ComponentTypes.CONTROLLER, configuration, null);
    }

}