import { ComponentTypes } from "../../../components-registry/componentTypes.ts";
import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";

export const Middleware = (regexRoute: RegExp, name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, ComponentTypes.MIDDLEWARE, {
            regexRoute: regexRoute
        }, index);
    };
};