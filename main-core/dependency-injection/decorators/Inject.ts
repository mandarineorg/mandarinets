import { DependencyInjectionUtil } from "../di.util.ts";
import { DI } from "../di.ns.ts";

export const Inject = (injectableObject?: any): Function => {
    return (target: any, propertyName: string, index: number) => {
         // If index is not null then it is a parameter otherwise it is a class property.
        DependencyInjectionUtil.defineInjectionMetadata(DI.InjectionTypes.INJECTABLE_OBJECT, injectableObject, target, propertyName, index);
    };
};