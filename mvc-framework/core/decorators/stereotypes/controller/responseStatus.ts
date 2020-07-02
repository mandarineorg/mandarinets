import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

export const ResponseStatus = (httpCode: Mandarine.MandarineMVC.HttpStatusCode): Function => {
    return (target: any, methodName: string) => {
        MVCDecoratorsProxy.registerResponseStatusDecorator(target, httpCode, methodName);
    };
}