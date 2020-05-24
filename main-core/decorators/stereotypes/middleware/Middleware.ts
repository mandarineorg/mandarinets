import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../Mandarine.ns.ts";

/**
 * **Decorator**
 * 
 * Register a component type Middleware in the DI Container
 *
 * `@Middleware(regexRoute: RegExp, name?: string)
 *  Target: class`
 */
export const Middleware = (regexRoute: RegExp, name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE, {
            regexRoute: regexRoute
        }, index);
    };
};