import { ComponentRegistryContext } from "./componentRegistryContext.ts";
import { ComponentTypes } from "./componentTypes.ts";
import { ComponentFactoryError } from "../../mvc-framework/core/exceptions/mandarine/componentFactoryError.ts";
import { DIFactory } from "../dependency-injection/constructorResolver.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";

export class ComponentsRegistry {

    private components: Map<string, ComponentRegistryContext> = new Map<string, ComponentRegistryContext>();

    public register(componentName: string, componentInstance: any, componentType: ComponentTypes, configuration: any): void {
        let componentExist: boolean = this.exist(componentName);

        if(componentExist) {
            throw new ComponentFactoryError(ComponentFactoryError.EXISTENT_COMPONENT, `${componentName}`);
        } else {

            let componentInstanceInitialized: any;
            let componentHandler: any;

            if(ReflectUtils.constructorHasParameters(componentInstance)) componentHandler = DIFactory(componentInstance);
            else componentHandler = new componentInstance();

            switch(componentType) {
                case ComponentTypes.CONTROLLER:
                    componentInstanceInitialized = new ControllerComponent(componentName, configuration.pathRoute, componentInstance, componentHandler);
                    break;
                case ComponentTypes.SERVICE:
                    componentInstanceInitialized = new ServiceComponent(componentName, componentHandler);
                break;
            }

            this.components.set(componentName, {
                classParentName: componentName,
                componentName: componentName,
                componentInstance: componentInstanceInitialized,
                componentType: componentType
            });
        }
    }

    public get(itemName: string): ComponentRegistryContext {
        return this.components.get(itemName);
    }

    public update(itemName: string, newValue: ComponentRegistryContext): void {
        this.components.set(itemName, newValue);
    }

    public exist(itemName: string): boolean {
        if(this.components.get(itemName) != null) return true;
        else return false;
    }

    public getAllComponentNames(): Array<string> {
        return Array.from(this.components.keys());
    }

    public getAllComponentNamesByType(componentType: ComponentTypes): Array<string> {
        return Array.from(this.components.values()).filter(item => item.componentType == componentType).map(item => item.componentName);
    }

    public getComponents(): ComponentRegistryContext[] {
        return Array.from(this.components.values());
    }

    public getControllers(): ComponentRegistryContext[] {
        return Array.from(this.components.values()).filter(item => item.componentType == ComponentTypes.CONTROLLER);
    }
}