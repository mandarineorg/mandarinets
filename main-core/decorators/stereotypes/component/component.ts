import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Component in the DI Container
 *
 * `@Component()
 *  Target: class`
 */
export const Component = (): Function => {
    return (target: any, methodName: string, index: number) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, index);
    };
};