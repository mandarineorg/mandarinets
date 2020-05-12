import { ControllerComponent } from "../../../internal/components/routing/controllerContext.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { ComponentRegistryContext } from "../../../../../main-core/components-registry/componentRegistryContext.ts";
import { ComponentUtils } from "../../../../../main-core/utils/componentUtils.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";

export const Controller = (baseRoute?: string, name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        let className: string = ReflectUtils.getClassName(target);
            if(ApplicationContext.getInstance().getComponentsRegistry().exist(className)) {

                let objectContext: ComponentRegistryContext = ApplicationContext.getInstance().getComponentsRegistry().get(className);
                let controllerComponent:ControllerComponent = <ControllerComponent> objectContext.componentInstance;
                controllerComponent.setRoute(baseRoute);

                ApplicationContext.getInstance().getComponentsRegistry().update(className, objectContext);
            } else {
                ComponentUtils.createControllerComponent(name, { pathRoute: baseRoute }, target);
            }
    };
};
