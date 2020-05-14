import { ReflectUtils } from "../../utils/reflectUtils.ts";
import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { ComponentTypes } from "../../components-registry/componentTypes.ts";
import { Reflect } from "../../reflectMetadata.ts";

export const Injectable = () => {
    return (target: any, methodName: string) => {
        let componentExist: boolean = ApplicationContext.getInstance().getComponentsRegistry().exist(methodName);

        if(!componentExist) {
            ApplicationContext.getInstance().getComponentsRegistry().register(methodName, target[methodName](), ComponentTypes.MANUAL_COMPONENT, {});
        }
    }
}