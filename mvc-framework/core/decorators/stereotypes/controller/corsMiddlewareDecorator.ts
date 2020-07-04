import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

export const Cors = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption): Function => {
    return (target: any, methodName: string) => {
        MVCDecoratorsProxy.registerCORSMiddlewareDecorator(target, corsOptions, methodName);
    };
}