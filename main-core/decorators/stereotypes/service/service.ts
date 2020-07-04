import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Service in the DI Container
 *
 * `@Service()
 *  Target: class`
 */
export const Service = (): Function => {
    return (target: any, methodName: string, index: number) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, index);
    };
};