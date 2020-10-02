// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { DI } from "./di.ns.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import { RoutingUtils } from "../../mvc-framework/core/utils/mandarine/routingUtils.ts";
import type { Mandarine } from "../Mandarine.ns.ts";

/**
 * Contains all the util methods that are related to the DI built-in framework.
 */
export class DependencyInjectionUtil {

    /**
     * Defines the context for a new injection inside the DI system
     */
    public static defineInjectionMetadata(injectionType: DI.InjectionTypes, target: any, propertyName: string, parameterIndex: number, specificParameterName?: string, parameterConfiguration?: any) {
        let isMethod: boolean = (parameterIndex != null);
        let parentClassName: string = ReflectUtils.getClassName(target);

        if(isMethod) {
            let methodArgumentTypes = Reflect.getMetadata("design:paramtypes", target, propertyName);

            let methodParams: Array<string> = ReflectUtils.getParamNames(target[propertyName]);
            let parameterName: string = methodParams[parameterIndex];

            let varName: string = parameterName; // If it is a property we catch its name

            if(specificParameterName != (null || undefined)) varName = specificParameterName; // If the user specified an specific parameter name, then we use it.

            let parameterDependencyInjectionMetadataName = `${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER:${injectionType}:${varName}:${(parameterIndex == (null || undefined) ? 0 : parameterIndex)}`;

            let annotationContext: DI.InjectionMetadataContext = {
                injectionType: injectionType,
                parameterName: varName,
                parameterIndex: parameterIndex,
                parameterMethodName: propertyName,
                parameterObjectToInject: (injectionType == DI.InjectionTypes.INJECTABLE_OBJECT) ? methodArgumentTypes[parameterIndex] : undefined,
                propertyName: <string> <unknown> undefined,
                className: parentClassName,
                parameterConfiguration: parameterConfiguration
            };

            let metadataKeys: Array<any> = (isMethod) ? Reflect.getMetadataKeys(target, propertyName) : Reflect.getMetadataKeys(target);

            if(metadataKeys != null) {
                if(metadataKeys.some(metadataKey => metadataKey == parameterDependencyInjectionMetadataName)) {
                    return;
                }
            }

            Reflect.defineMetadata(parameterDependencyInjectionMetadataName, annotationContext, target, propertyName);

        } else {
            let propertyType = Reflect.getMetadata("design:type", target, propertyName);
            
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_INJECTABLE_FIELD}:${propertyName}`, {
                propertyType: propertyType,
                propertyTypeName: propertyType.name,
                propertyName: propertyName
            }, target);
        }
    }

    /**
     * Defines metadata for a pipe
     */
     public static definePipeMetadata(target: any, pipes: Array<any> | any, propertyName: string, parameterIndex: number) {
        if(parameterIndex === undefined) {
            throw new MandarineException(MandarineException.INVALID_PIPE_LOCATION);
        } else {
            let methodParams: Array<string> = ReflectUtils.getParamNames(target[propertyName]);
            let parameterName: string = methodParams[parameterIndex];

            const parameterPipeName = `${MandarineConstants.REFLECTION_MANDARINE_PIPE_FIELD}:${parameterIndex}:${propertyName}`;
            Reflect.defineMetadata(parameterPipeName, pipes, target, propertyName);
        }
     }

     /**
      * Get Handler inforamtion
      * 
      */
     public static getDIHandlerContext(object: any, methodName: string, context: Mandarine.Types.RequestContext) {
        const componentMethodParams: Array<string> = ReflectUtils.getParamNames(object[methodName]);

        const methodAnnotationMetadata: Array<any> = Reflect.getMetadataKeys(object, methodName);
        const methodInjectableParameters: Array<any> = methodAnnotationMetadata.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER`));
        if(methodInjectableParameters == null) return undefined;

        let metadataValues: Array<DI.InjectionMetadataContext> = new Array<DI.InjectionMetadataContext>();
        methodInjectableParameters.forEach((paramMetadataKey: string) => {
            let metadataValue: DI.InjectionMetadataContext = <DI.InjectionMetadataContext> Reflect.getMetadata(paramMetadataKey, object, methodName);
            metadataValues.push(metadataValue);
        });
        metadataValues = metadataValues.sort((a, b) => a.parameterIndex - b.parameterIndex);

        const queryParams = RoutingUtils.findQueryParams(context.request.url.toString());

        return {
            componentMethodParams: componentMethodParams,
            metadataValues: metadataValues,
            queryParams: queryParams,
            routeParams: context.params,
            requestCookies: context.cookies
        }
     }
}