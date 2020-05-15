import { ServerRequest } from "https://deno.land/std@v1.0.0-rc1/http/server.ts";
import { ControllerComponent } from "../../internal/components/routing/controllerContext.ts";
import { AnnotationMetadataContext } from "../../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";
import { DependencyInjectionUtil } from "../../../../main-core/dependency-injection/di.util.ts";
import { ReflectUtils } from "../../../../main-core/utils/reflectUtils.ts";
import { Reflect } from "../../../../main-core/reflectMetadata.ts"
import { MandarineConstants } from "../../../../main-core/mandarineConstants.ts";
import { DI } from "../../../../main-core/dependency-injection/di.ns.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";

export class RoutingUtils {

    public static registerHttpAction(route: string, methodType: Mandarine.MandarineMVC.HttpMethods, target: any, methodName: string, options: Mandarine.MandarineMVC.Routing.RoutingOptions) {
        let className: string = ReflectUtils.getClassName(target);

        let currentTargetAnnotations: Array<any> = Reflect.getMetadataKeys(target);
        let httpMethodAnnotationName: string = `${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE}:${methodName}:${methodType}`;

        if(!currentTargetAnnotations.some(metadataKeys => metadataKeys == httpMethodAnnotationName)) {
            let annotationContext: AnnotationMetadataContext = {
                type: "ROUTE",
                context: {
                    route: route,
                    methodType: methodType,
                    methodName: methodName,
                    options: options,
                    className: className
                }
            };

            Reflect.defineMetadata(httpMethodAnnotationName, annotationContext, target);
        }
    }

    public static registerRoutingParam(parameterType: DI.InjectionTypes, target: any, methodName: string, parameterIndex: number, specificParameterName?: string) {
        DependencyInjectionUtil.defineInjectionMetadata(parameterType, undefined, target, methodName, parameterIndex, specificParameterName);
    }

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