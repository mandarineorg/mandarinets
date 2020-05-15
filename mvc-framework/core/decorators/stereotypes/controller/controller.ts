import { ControllerComponent } from "../../../internal/components/routing/controllerContext.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { ComponentUtils } from "../../../../../main-core/utils/componentUtils.ts";
import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const Controller = (baseRoute?: string, name?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        let className: string = ReflectUtils.getClassName(target);
        let getComponentsRegistry = ApplicationContext.getInstance().getComponentsRegistry();
            if(getComponentsRegistry.exist(className)) {

                let objectContext: Mandarine.MandarineCore.ComponentRegistryContext = getComponentsRegistry.get(className);
                let controllerComponent:ControllerComponent = <ControllerComponent> objectContext.componentInstance;
                controllerComponent.setRoute(baseRoute);

                getComponentsRegistry.update(className, objectContext);
            } else {
                ComponentUtils.createControllerComponent(name, { pathRoute: baseRoute }, target);
            }
    };
};
