import { ComponentTypes } from "../components-registry/componentTypes.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";

export const getDependencyInstance = (componentType: ComponentTypes, componentInstance: any): any => {
    switch(componentType) {
        case ComponentTypes.CONTROLLER:
            return (<ControllerComponent> componentInstance).getClassHandler();
        case ComponentTypes.SERVICE:
            return (<ServiceComponent> componentInstance).getClassHandler();
        case ComponentTypes.CONFIGURATION:
            return (<ConfigurationComponent> componentInstance).getClassHandler();
        case ComponentTypes.COMPONENT:
            return (<ComponentComponent> componentInstance).getClassHandler();
    }
    return null;
}