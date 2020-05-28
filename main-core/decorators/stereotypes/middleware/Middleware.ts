import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Middleware in the DI Container
 *
 * `@Middleware(regexRoute: RegExp)
 *  Target: class`
 */
export const Middleware = (regexRoute: RegExp): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(target, Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE, {
            regexRoute: regexRoute
        }, index);
    };
};