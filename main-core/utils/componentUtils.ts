import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class ComponentUtils {

    public static createControllerComponent(configuration: any, classHandler: any) {
        ComponentsRegistryUtil.registerComponent(classHandler, Mandarine.MandarineCore.ComponentTypes.CONTROLLER, configuration, null);
    }

}