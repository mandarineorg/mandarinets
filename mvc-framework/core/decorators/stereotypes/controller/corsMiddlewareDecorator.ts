import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../../../main-core/reflectMetadata.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";

export const Cors = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption): Function => {
    return (target: any, methodName: string) => {
        let className: string = ReflectUtils.getClassName(target);

        let corsAnnotationMetadataName: string = `${MandarineConstants.REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE}`;

        Reflect.defineMetadata(corsAnnotationMetadataName, corsOptions, target);
    };
}