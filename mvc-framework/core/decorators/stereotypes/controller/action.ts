import { HttpMethods } from "../../../enums/http/httpMethods.ts";
import { RoutingOptions } from "../../../interfaces/routing/routingOptions.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";

export const RequestMethod = (route: string, methodType?: HttpMethods, options?: RoutingOptions): Function => {
    return (target: Object, methodName: string) => {
        RoutingUtils.registerHttpAction(route, methodType, target, methodName, options);
    };
};