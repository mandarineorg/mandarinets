import { ComponentTypes } from "../components-registry/componentTypes.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";

export const getDependencyInstance = (componentType: ComponentTypes, componentInstance: any): any => {
    switch(componentType) {
        case ComponentTypes.CONTROLLER:
            return (<ControllerComponent> componentInstance).getClassHandler();
        case ComponentTypes.SERVICE:
            return (<ServiceComponent> componentInstance).getClassHandler();
    }
    return null;
}