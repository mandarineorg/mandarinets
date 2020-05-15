import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

export const Injectable = () => {
    return (target: any, methodName: string) => {
        let componentExist: boolean = ApplicationContext.getInstance().getComponentsRegistry().exist(methodName);

        if(!componentExist) {
            ApplicationContext.getInstance().getComponentsRegistry().register(methodName, target[methodName](), Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT, {});
        }
    }
}