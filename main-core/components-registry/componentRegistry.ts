import { ComponentRegistryContext } from "./componentRegistryContext.ts";
import { ComponentTypes } from "./componentTypes.ts";
import { ComponentFactoryError } from "../../mvc-framework/core/exceptions/mandarine/componentFactoryError.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { MiddlewareComponent } from "../components/middleware-component/middlewareComponent.ts";

export class ComponentsRegistry {

    private components: Map<string, ComponentRegistryContext> = new Map<string, ComponentRegistryContext>();

    public register(componentName: string, componentInstance: any, componentType: ComponentTypes, configuration: any): void {
        let componentExist: boolean = this.exist(componentName);

        if(componentExist) {
            throw new ComponentFactoryError(ComponentFactoryError.EXISTENT_COMPONENT, `${componentName}`);
        } else {

            let componentInstanceInitialized: any;
            let componentHandler: any = componentInstance;

            switch(componentType) {
                case ComponentTypes.CONTROLLER:
                    componentInstanceInitialized = new ControllerComponent(componentName, configuration.pathRoute, componentInstance, componentHandler);
                    break;
                case ComponentTypes.SERVICE:
                    componentInstanceInitialized = new ServiceComponent(componentName, componentHandler);
                break;
                case ComponentTypes.CONFIGURATION:
                    componentInstanceInitialized = new ConfigurationComponent(componentName, componentHandler);
                break;
                case ComponentTypes.COMPONENT:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler);
                break;
                case ComponentTypes.MIDDLEWARE:
                    componentInstanceInitialized = new MiddlewareComponent(componentName, configuration.regexRoute, componentHandler);
                break;
                case ComponentTypes.MANUAL_COMPONENT:
                    componentInstanceInitialized = componentInstance;
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

    public getComponentDefinitionNames(componentType?: ComponentTypes): Array<string> {
        if(componentType == (null || undefined)) return this.getAllComponentNames();
        else return this.getAllComponentNamesByType(componentType);
    }

    public isComponentHandlerTypeMatch(componentName: string, classType: any): boolean {
        let componentContext: ComponentRegistryContext = this.get(componentName);
        if(componentContext.componentType == ComponentTypes.MANUAL_COMPONENT) return componentContext.componentInstance instanceof classType;
        else componentContext.componentInstance.getClassHandler() instanceof classType;
        return false;
    }

    public getComponentByHandlerType(classType: any): ComponentRegistryContext {
        return this.getComponents().find(component => {
            let instance = undefined;
                if(component.componentType != ComponentTypes.MANUAL_COMPONENT) {
                    instance = component.componentInstance.getClassHandler();
                } else {
                    instance = component.componentInstance;
                }
                return  instance instanceof classType;
        });
    }

    public getComponentType(componentName: string): string {
        let componentContext: ComponentRegistryContext = this.get(componentName);
        switch(componentContext.componentType) {
            case ComponentTypes.CONTROLLER:
                let component: ControllerComponent = <ControllerComponent> componentContext.componentInstance;
                return component.getClassHandler().constructor.name; 
            break;
        }
    }

    public resolveDependencies(): void {
        return DI.componentDependencyResolver(this);
    }
}