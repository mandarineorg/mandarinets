import { ReflectUtils } from "../../utils/reflectUtils.ts";
import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { ComponentTypes } from "../../components-registry/componentTypes.ts";

export const Injectable = () => {
    return (target: any, methodName: string) => {
        let componentExist: boolean = ApplicationContext.getInstance().getComponentsRegistry().exist(methodName);

        let componentExistsInMandarine: boolean = ApplicationContext.getInstance().getPredefinedInjectables().hasOwnProperty(methodName);

        if(!componentExist && !componentExistsInMandarine) {
            ApplicationContext.getInstance().getPredefinedInjectables()[methodName] = target[methodName]();
            ApplicationContext.getInstance().getComponentsRegistry().register(methodName, ApplicationContext.getInstance().getPredefinedInjectables()[methodName], ComponentTypes.MANUAL_COMPONENT, {});
        }
    }
}