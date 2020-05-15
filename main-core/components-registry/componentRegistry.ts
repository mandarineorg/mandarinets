import { ComponentFactoryError } from "../../mvc-framework/core/exceptions/mandarine/componentFactoryError.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { MiddlewareComponent } from "../components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class ComponentsRegistry implements Mandarine.MandarineCore.IComponentsRegistry {

    private components: Map<string, Mandarine.MandarineCore.ComponentRegistryContext> = new Map<string, Mandarine.MandarineCore.ComponentRegistryContext>();

    public register(componentName: string, componentInstance: any, componentType: Mandarine.MandarineCore.ComponentTypes, configuration: any): void {
        let componentExist: boolean = this.exist(componentName);

        if(componentExist) {
            throw new ComponentFactoryError(ComponentFactoryError.EXISTENT_COMPONENT, `${componentName}`);
        } else {

            let componentInstanceInitialized: any;
            let componentHandler: any = componentInstance;

            switch(componentType) {
                case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                    componentInstanceInitialized = new ControllerComponent(componentName, configuration.pathRoute, componentInstance, componentHandler);
                    break;
                case Mandarine.MandarineCore.ComponentTypes.SERVICE:
                    componentInstanceInitialized = new ServiceComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.CONFIGURATION:
                    componentInstanceInitialized = new ConfigurationComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.COMPONENT:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE:
                    componentInstanceInitialized = new MiddlewareComponent(componentName, configuration.regexRoute, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT:
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

    public get(itemName: string): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.components.get(itemName);
    }

    public update(itemName: string, newValue: Mandarine.MandarineCore.ComponentRegistryContext): void {
        this.components.set(itemName, newValue);
    }

    public exist(itemName: string): boolean {
        if(this.components.get(itemName) != null) return true;
        else return false;
    }

    public getAllComponentNames(): Array<string> {
        return Array.from(this.components.keys());
    }

    public getAllComponentNamesByType(componentType: Mandarine.MandarineCore.ComponentTypes): Array<string> {
        return Array.from(this.components.values()).filter(item => item.componentType == componentType).map(item => item.componentName);
    }

    public getComponents(): Mandarine.MandarineCore.ComponentRegistryContext[] {
        return Array.from(this.components.values());
    }

    public getControllers(): Mandarine.MandarineCore.ComponentRegistryContext[] {
        return Array.from(this.components.values()).filter(item => item.componentType == Mandarine.MandarineCore.ComponentTypes.CONTROLLER);
    }

    public getComponentDefinitionNames(componentType?: Mandarine.MandarineCore.ComponentTypes): Array<string> {
        if(componentType == (null || undefined)) return this.getAllComponentNames();
        else return this.getAllComponentNamesByType(componentType);
    }

    public isComponentHandlerTypeMatch(componentName: string, classType: any): boolean {
        let componentContext: Mandarine.MandarineCore.ComponentRegistryContext = this.get(componentName);
        if(componentContext.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) return componentContext.componentInstance instanceof classType;
        else componentContext.componentInstance.getClassHandler() instanceof classType;
        return false;
    }

    public getComponentByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getComponents().find(component => {
            let instance = undefined;
                if(component.componentType != Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) {
                    instance = component.componentInstance.getClassHandler();
                } else {
                    instance = component.componentInstance;
                }
                return  instance instanceof classType;
        });
    }

    public getComponentType(componentName: string): string {
        let componentContext: Mandarine.MandarineCore.ComponentRegistryContext = this.get(componentName);
        switch(componentContext.componentType) {
            case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                let component: ControllerComponent = <ControllerComponent> componentContext.componentInstance;
                return component.getClassHandler().constructor.name; 
            break;
        }
    }

    public resolveDependencies(): void {
        return DI.componentDependencyResolver(this);
    }
}