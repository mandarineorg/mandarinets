import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Component in the DI Container
 *
 * `@Component()
 *  Target: class`
 */
export const Component = (): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(target, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, index);
    };
};