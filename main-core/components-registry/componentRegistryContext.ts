import { ComponentTypes } from "./componentTypes.ts";

export interface ComponentRegistryContext {
    classParentName: string;
    componentName?: string;
    componentInstance: any;
    componentType: ComponentTypes;
}