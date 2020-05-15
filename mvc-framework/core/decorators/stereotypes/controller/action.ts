import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export const RequestMethod = (route: string, methodType?: Mandarine.MandarineMVC.HttpMethods, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (target: Object, methodName: string) => {
        RoutingUtils.registerHttpAction(route, methodType, target, methodName, options);
    };
};