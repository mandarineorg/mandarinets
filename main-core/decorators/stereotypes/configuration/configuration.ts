import { ComponentTypes } from "../../../components-registry/componentTypes.ts";
import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";

export const Configuration = (name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, ComponentTypes.CONFIGURATION, {}, index);
    };
};