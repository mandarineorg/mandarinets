// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { DI } from "../../../main-core/dependency-injection/di.ns.ts";
import { DependencyInjectionUtil } from "../../../main-core/dependency-injection/di.util.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";
import { ComponentUtils } from "../../../main-core/utils/componentUtils.ts";
import { ReflectUtils } from "../../../main-core/utils/reflectUtils.ts";
import { AnnotationMetadataContext } from "../interfaces/mandarine/mandarineAnnotationMetadataContext.ts";
import { NonComponentMiddlewareTarget } from "../../../main-core/internals/interfaces/middlewareTarget.ts";

export class MVCDecoratorsProxy {

    public static registerResponseStatusDecorator(targetClass: any, httpCode: Mandarine.MandarineMVC.HttpStatusCode, methodName: string) {
        let isMethod: boolean = methodName != null;
        if(!isMethod) {
            let httpResponseStatusAnnotation: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE}`;
            Reflect.defineMetadata(httpResponseStatusAnnotation, httpCode, targetClass);
        } else {
            let httpResponseStatusAnnotation: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE}:${methodName}`;
            Reflect.defineMetadata(httpResponseStatusAnnotation, httpCode, targetClass, methodName);
        }
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

    public static registerUseMiddlewareDecorator(targetClass: any, middlewareList: Array<NonComponentMiddlewareTarget | any>, methodName: string) {
        let isMethod: boolean = methodName != null;
        if(!isMethod) {
            let useMiddlewareAnnotationName: string = `${MandarineConstants.REFLECTION_MANDARINE_USE_MIDDLEWARE_DECORATOR}`;
            Reflect.defineMetadata(useMiddlewareAnnotationName, [...middlewareList], targetClass);
        } else {
            let useMiddlewareAnnotationName: string = `${MandarineConstants.REFLECTION_MANDARINE_USE_MIDDLEWARE_DECORATOR}:${methodName}`;
            Reflect.defineMetadata(useMiddlewareAnnotationName, [...middlewareList], targetClass, methodName);
        }
    }

    public static registerControllerComponent(targetClass: any, baseRoute: string) {
        ComponentUtils.createControllerComponent({ pathRoute: baseRoute }, targetClass);
    }

    public static registerRoutingParam(targetClass: any, parameterType: DI.InjectionTypes, methodName: string, parameterIndex: number, specificParameterName?: string) {
        DependencyInjectionUtil.defineInjectionMetadata(parameterType, targetClass, methodName, parameterIndex, specificParameterName);
    }

    public static registerPipeInParam(targetClass: any, pipes: Array<any> | any, methodName: string, parameterIndex: number) {
        DependencyInjectionUtil.definePipeMetadata(targetClass, pipes, methodName, parameterIndex);
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