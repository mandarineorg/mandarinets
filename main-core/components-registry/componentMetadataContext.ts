import { ComponentTypes } from "./componentTypes.ts";

export interface ComponentMetadataContext {
    componentName: string;
    componentType: ComponentTypes;
    componentInstance: any;
    componentConfiguration?: any;
    classParentName: string;
}