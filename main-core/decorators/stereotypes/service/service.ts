import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Service in the DI Container
 *
 * `@Service()
 *  Target: class`
 */
export const Service = (): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(target, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, index);
    };
};