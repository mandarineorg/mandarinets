import { ComponentsRegistryUtil } from "../../../main-core/components-registry/componentRegistry.util.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";

export const Repository = (): Function => {
    return (target: any) => {
        ComponentsRegistryUtil.registerRepositoryComponent(target);
    };
}

export const CustomQuery = (query: string, secure?: boolean): Function => {
    return (target: any, methodName: string) => {
        if(secure == undefined) secure = true;
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY}:${methodName}`, {
            query: query,
            secure: secure
        }, target, methodName);
    }
}