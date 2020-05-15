import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";

export interface ResponseStatusMetadataContext {
    classParentName: string;
    responseStatus: Mandarine.MandarineMVC.HttpStatusCode;
    methodName?: string;
}

export const ResponseStatus = (httpCode: Mandarine.MandarineMVC.HttpStatusCode): Function => {
    return (target: any, methodName: string) => {
        let className: string = ReflectUtils.getClassName(target);

        let defaultHttpResponseAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE}`;

        let metadataContext: ResponseStatusMetadataContext = {
            classParentName: className,
            responseStatus: httpCode,
            methodName: methodName
        };
        
        Reflect.defineMetadata(defaultHttpResponseAnnotationMetadataName, metadataContext, target);
    };
}