// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";

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
    
    public static findRouteParamSignature(route: string, method: Mandarine.MandarineMVC.HttpMethods): Array<string> {
        if(route == null) return null;
        return route.split('/').reduce((acc: string[], el: string, i: any) => {
            if(acc.length === 0) acc.push(`${method}`);
            if (/:[A-Za-z1-9]{1,}/.test(el)) {
                acc.push(":param");
            }  else if(el && el != "") { 
                acc.push(el) 
            }
            return acc;
        }, []);
    }

    public static getRouteParamPattern(route: string): RegExp  {
        return new RegExp(route.replace(/:[^\s/]+/g, '([\\w-]+)'));
    }
}