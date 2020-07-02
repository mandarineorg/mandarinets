import { ServerRequest } from "https://deno.land/std/http/server.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { ControllerComponent } from "../../internal/components/routing/controllerContext.ts";

/**
 * Contains all the util methods that are related to the router and routings
 */
export class RoutingUtils {

    public static findQueryParams(url: string): URLSearchParams | undefined {
        if (url == undefined) return undefined;
        const searchs = url.split('?')[1];
        if (searchs == undefined) return undefined;
        return new URLSearchParams(searchs);
    }

    public static findRouteParams(url: string): Mandarine.MandarineMVC.Routing.RoutingParams[] {
        if(url == null) return null;
        return url.split('/').reduce((acc: Mandarine.MandarineMVC.Routing.RoutingParams[], el, i) => {
            if (/:[A-Za-z1-9]{1,}/.test(el)) {
                const result: string = el.replace(':', '');
                acc.push({ routeIndex: i, routeName: result});
            }
            return acc;
        }, []);
    }

    public static getRouteParamPattern(route: string): RegExp  {
        return new RegExp(route.replace(/:[^\s/]+/g, '([\\w-]+)'));
    }

    public static getRouteParamValues(controllerComponent: ControllerComponent, routeAction: Mandarine.MandarineMVC.Routing.RoutingAction, request: ServerRequest): any {
        if(routeAction.routeParams == (null || undefined)) return null;
        if(routeAction.routeParams.length == 0) return null;
        let paramValues: any = new URL("http://localhost" + request.url).pathname.match(RoutingUtils.getRouteParamPattern(controllerComponent.getActionRoute(routeAction)));
        
        if(paramValues == null) return null;

        let objectOfValues = {};
        for (var i = 1; i < paramValues.length; i++) {
            objectOfValues[routeAction.routeParams[i - 1].routeName] = paramValues[i];
        }

        return objectOfValues;
    }
}