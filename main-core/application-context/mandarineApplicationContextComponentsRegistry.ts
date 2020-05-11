import { ApplicationContext } from "./mandarineApplicationContext.ts";
import { ComponentRegistryContext } from "../components-registry/componentRegistryContext.ts";
import { ComponentTypes } from "../components-registry/componentTypes.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";

export class MandarineApplicationContextComponentsRegistry {

    public getComponentDefinitionNames(componentType?: ComponentTypes): Array<string> {
        if(componentType == (null || undefined)) return ApplicationContext.getInstance().getComponentsRegistry().getAllComponentNames();
        else return ApplicationContext.getInstance().getComponentsRegistry().getAllComponentNamesByType(componentType);
    }

    public getComponent(componentName: string): ComponentRegistryContext {
        return ApplicationContext.getInstance().getComponentsRegistry().get(componentName);
    }

    public containsComponent(componentName: string): boolean {
        return ApplicationContext.getInstance().getComponentsRegistry().exist(componentName);
    }

    public isComponentTypeMatch(componentName: string, classType: any): boolean {
        let componentContext: ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(componentName);
        switch(componentContext.componentType) {
            case ComponentTypes.CONTROLLER:
                let component: ControllerComponent = <ControllerComponent> componentContext.componentInstance;
                return (component.getClassHandler() instanceof classType);
            break;
        }
        return false;
    }

    public getComponentType(componentName: string): string {
        let componentContext: ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(componentName);
        switch(componentContext.componentType) {
            case ComponentTypes.CONTROLLER:
                let component: ControllerComponent = <ControllerComponent> componentContext.componentInstance;
                return component.getClassHandler().constructor.name; 
            break;
        }
    }

}