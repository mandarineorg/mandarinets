import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Service in the DI Container
 *
 * `@Service(name?: string)
 *  Target: class`
 */
export const Service = (name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, index);
    };
};