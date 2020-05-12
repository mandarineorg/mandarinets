import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { ComponentTypes } from "../../../components-registry/componentTypes.ts";

export const Service = (name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, ComponentTypes.SERVICE, {}, index);
    };
};