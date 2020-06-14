import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";

export const Cors = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption): Function => {
    return (target: any, methodName: string) => {
        let isMethod: boolean = methodName != null;
        if(!isMethod) {
            let corsAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE}`;
            Reflect.defineMetadata(corsAnnotationMetadataName, corsOptions, target);
        } else {
            let corsAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE}:${methodName}`;
            Reflect.defineMetadata(corsAnnotationMetadataName, corsOptions, target, methodName);
        }
    };
}