import { Reflect } from "../reflectMetadata.ts";
import { InjectionMetadataContext } from "./injectionMetadataContext.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { InjectionTypes } from "./injectionTypes.ts";
import { ArgumentsResolverExtraData } from "./argumentsResolverExtraData.ts";
import { RoutingUtils } from "../../mvc-framework/core/utils/mandarine/routingUtils.ts";
import { getCookies } from "https://deno.land/std@v1.0.0-rc1/http/cookie.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { getDependencyInstance } from "./getDependencyInstance.ts";
import { decoder } from "https://deno.land/std@v1.0.0-rc1/encoding/utf8.ts";
import { HttpUtils } from "../utils/httpUtils.ts";
export type ArgumentValue = any;
export const MethodArgumentsResolver = async (object: any, methodName: string, extraData: ArgumentsResolverExtraData) => {
    const args: Array<ArgumentValue> = [];

    let componentMethodParams: Array<string> = ReflectUtils.getParamNames(object[methodName]);

    let methodAnnotationMetadata: Array<any> = Reflect.getMetadataKeys(object, methodName);
    let methodInjectableDependencies: Array<any> = methodAnnotationMetadata.filter((metadataKey: string) => metadataKey.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_INJECTION_FIELD}:PARAMETER`));
    if(methodInjectableDependencies == null) return args;

    let metadataValues: Array<InjectionMetadataContext> = new Array<InjectionMetadataContext>();

    methodInjectableDependencies.forEach((dependencyMetadataKey: string) => {
        let metadataValue: InjectionMetadataContext = <InjectionMetadataContext> Reflect.getMetadata(dependencyMetadataKey, object, methodName);
        metadataValues.push(metadataValue);
    });

    metadataValues = metadataValues.sort((a, b) => a.parameterIndex - b.parameterIndex);

    const queryParams = RoutingUtils.findQueryParams(extraData.request.url);
    const requestCookies = getCookies(extraData.request.serverRequest);

    for(let i = 0; i < componentMethodParams.length; i++) {
        if(!metadataValues.some((injectionMetadata: InjectionMetadataContext) => injectionMetadata.parameterIndex === i)) {
            args.push(undefined);
        } else {
            const param = metadataValues.find(injectionMetadata => injectionMetadata.parameterIndex === i);
            switch(param.injectionType) {
                case InjectionTypes.QUERY_PARAM:
                    if(queryParams) args.push(queryParams.get(param.parameterName));
                    else args.push(undefined);
                    break;
                case InjectionTypes.ROUTE_PARAM:
                    if(extraData.params) args.push(extraData.params[param.parameterName]);
                    else args.push(undefined);
                    break;
                case InjectionTypes.REQUEST_PARAM:
                    args.push(extraData.request);
                    break;
                case InjectionTypes.SESSION_PARAM:
                    args.push((<any> extraData.request).session)
                    break;
                case InjectionTypes.SERVER_REQUEST_PARAM:
                    args.push(extraData.request.serverRequest);
                break;
                case InjectionTypes.REQUEST_BODY_PARAM:
                    args.push(await HttpUtils.parseBody(extraData.request));
                break;
                case InjectionTypes.RESPONSE_PARAM:
                    args.push(extraData.response);
                    break;
                case InjectionTypes.COOKIE_PARAM:
                    if(requestCookies[param.parameterName]) args.push(requestCookies[param.parameterName]);
                    else args.push(undefined);
                    break;
                case InjectionTypes.INJECTABLE_OBJECT:
                    if(ApplicationContext.getInstance().getComponentsRegistry().exist(param.parameterObjectToInject.name)) {
                        let component = ApplicationContext.getInstance().getComponentsRegistry().get(param.parameterObjectToInject.name);
                        args.push(getDependencyInstance(component.componentType, component.componentInstance));
                    }
                    else args.push(undefined);
                    break;
            }
        }
    }

    if (args.length == 0) return null;
    return args;
}