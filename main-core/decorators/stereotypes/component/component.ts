import { ComponentsRegistryUtil } from "../../../components-registry/componentRegistry.util.ts";
import { ComponentTypes } from "../../../components-registry/componentTypes.ts";

export const Component = (name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        ComponentsRegistryUtil.registerComponent(name, target, ComponentTypes.COMPONENT, {}, index);
    };
};