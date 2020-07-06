import { DependencyInjectionDecoratorsProxy } from "../../proxys/dependencyInjectionDecorator.ts";

/**
 * **Decorator**
 * 
 * Defines the context for injection to a property.
 * This is used for manual injections, although, all injections should be done through the constructor of a class.
 *
 * `@Inject(injectableObject?: any)
 *  Target: property/method parameter`
 */
export const Inject = (): Function => {
    return (target: any, propertyName: string, index: number) => {
         // If index is not null then it is a parameter otherwise it is a class property.
        DependencyInjectionDecoratorsProxy.registerInject(target, propertyName, index);
    };
};