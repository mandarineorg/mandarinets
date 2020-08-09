import { Mandarine } from "../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

export const Override = (type?: Mandarine.MandarineCore.NativeComponents) => {
    return (targetClass: any) => {
        MainCoreDecoratorProxy.overrideNativeComponent(targetClass, type);
    }
};