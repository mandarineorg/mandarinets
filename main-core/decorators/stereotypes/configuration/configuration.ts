import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Configuration in the DI Container
 *
 * `@Configuration()
 *  Target: class`
 */
export const Configuration = (): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(target, Mandarine.MandarineCore.ComponentTypes.CONFIGURATION, {}, index);
    };
};