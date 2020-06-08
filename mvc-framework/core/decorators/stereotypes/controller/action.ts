import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { RoutingUtils } from "../../../utils/mandarine/routingUtils.ts";

/**
 * **Decorator**
 * 
 * Defines a new HTTP handler manually, meaning, you have to specify what type of handler you are using.
 * This is not recommended, instead, use @POST, @GET, @PATCH, @DELETE, @HEAD, @OPTIONS
 * 
 * `@RequestMethod(route, methodType, options)
 *  Target: Method`
 */
export const RequestMethod = (route: string, methodType: Mandarine.MandarineMVC.HttpMethods, options?: Mandarine.MandarineMVC.Routing.RoutingOptions): Function => {
    return (target: Object, methodName: string) => {
        RoutingUtils.registerHttpAction(route, methodType, target, methodName, options);
    };
};