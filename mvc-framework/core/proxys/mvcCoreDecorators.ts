import { DI } from "../../../main-core/dependency-injection/di.ns.ts";
import { DependencyInjectionUtil } from "../../../main-core/dependency-injection/di.util.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";
import { ComponentUtils } from "../../../main-core/utils/componentUtils.ts";
import { ReflectUtils } from "../../../main-core/utils/reflectUtils.ts";
import { AnnotationMetadataContext } from "../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";

export class MVCDecoratorsProxy {

    public static registerResponseStatusDecorator(targetClass: any, httpCode: Mandarine.MandarineMVC.HttpStatusCode, methodName: string) {
        let className: string = ReflectUtils.getClassName(targetClass);

        let defaultHttpResponseAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE}`;

        let metadataContext: Mandarine.MandarineMVC.ResponseStatusMetadataContext = {
            classParentName: className,
            responseStatus: httpCode,
            methodName: methodName
        };
        
        Reflect.defineMetadata(defaultHttpResponseAnnotationMetadataName, metadataContext, targetClass);
    }

    public static registerCORSMiddlewareDecorator(targetClass: any, corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption, methodName: string) {
        let isMethod: boolean = methodName != null;
        let newCors: Mandarine.MandarineMVC.CorsMiddlewareOption = Object.assign({}, corsOptions);
        if(!isMethod) {
            let corsAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE}`;
            Reflect.defineMetadata(corsAnnotationMetadataName, newCors, targetClass);
        } else {
            let corsAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE}:${methodName}`;
            Reflect.defineMetadata(corsAnnotationMetadataName, newCors, targetClass, methodName);
        }
    }

    public static registerControllerComponent(targetClass: any, baseRoute: string) {
        ComponentUtils.createControllerComponent({ pathRoute: baseRoute }, targetClass);
    }

    public static registerRoutingParam(targetClass: any, parameterType: DI.InjectionTypes, methodName: string, parameterIndex: number, specificParameterName?: string) {
        DependencyInjectionUtil.defineInjectionMetadata(parameterType, targetClass, methodName, parameterIndex, specificParameterName);
    }

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

    public static registerRenderHandler(target: any, methodName: string, template: string, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines, options?: Mandarine.MandarineMVC.TemplateEngine.RenderingOptions) {
        if(engine == (null || undefined)) engine = Mandarine.Global.getMandarineConfiguration().mandarine.templateEngine.engine;
        
        let className: string = ReflectUtils.getClassName(target);
        let currentTargetAnnotations: Array<any> = Reflect.getMetadataKeys(target);
        let renderAnnotationName: string = `${MandarineConstants.REFLECTION_MANDARINE_METHOD_ROUTE_RENDER}:${methodName}`;

        if(!currentTargetAnnotations.some(metadataKeys => metadataKeys == renderAnnotationName)) {
            let annotationContext: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData = {
                className: className,
                template: template,
                engine: engine,
                options: options
            };

            Reflect.defineMetadata(renderAnnotationName, annotationContext, target, methodName);
        }

    }
}