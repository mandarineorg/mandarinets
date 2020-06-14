import { ComponentsRegistryUtil } from "../../../main-core/components-registry/componentRegistry.util.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";

/**
 * **Decorator**
 * 
 * Defines that an abstract class is a repository
 *
 * `@Repository()
 *  Target: Class`
 */
export const Repository = (): Function => {
    return (target: any) => {
        ComponentsRegistryUtil.registerRepositoryComponent(target);
    };
}

/**
 * **Decorator**
 * 
 * Defines that a repository method should not be resolved by MQL but it is a custom query and will be considered as such.
 *
 * `@CustomQuery(query, secure?)
 *  Target: Repository method`
 */
export const CustomQuery = (query: string, secure?: boolean): Function => {
    return (target: any, methodName: string) => {
        if(secure == undefined) secure = true;
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY}:${methodName}`, {
            query: query,
            secure: secure
        }, target, methodName);
    }
}