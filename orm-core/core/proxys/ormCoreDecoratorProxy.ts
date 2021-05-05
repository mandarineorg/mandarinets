// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { ComponentsRegistryUtil } from "../../../main-core/components-registry/componentRegistry.util.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../../main-core/mandarineConstants.ts";
import { Reflect } from "../../../main-core/reflectMetadata.ts";
import { IndependentUtils } from "../../../main-core/utils/independentUtils.ts";
import { Types } from "../../sql/types.ts";

export class ORMCoreDecoratorProxy {

    public static registerComponentRepositoryDecorator(targetClass: any) {
        ComponentsRegistryUtil.registerRepositoryComponent(targetClass);
    }

    public static registerCustomQueryDecorator(targetClass: any, query: string, secure: boolean, methodName: string) {
        if(secure == undefined) secure = true;
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY}:${methodName}`, {
            query: query,
            secure: secure
        }, targetClass, methodName);
    }

    public static registerTableDecorator(targetClass: any, decoratorOptions?: Mandarine.ORM.Entity.Decorators.Table) {
        ApplicationContext.getInstance().getEntityManager().entityRegistry.register(<string> decoratorOptions?.name, targetClass,  decoratorOptions?.schema);
    }

    public static registerColumnDecorator(targetClass: any, decoratorOptions: Mandarine.ORM.Entity.Decorators.Column, propertyKey: string) {
        var propertyType = Reflect.getMetadata("design:type", targetClass, propertyKey);
        var propertyTypeName = propertyType?.name;

        let currentTargetAnnotations: Array<any> = Reflect.getMetadataKeys(targetClass);

        if(decoratorOptions == undefined) decoratorOptions = {};

        if(decoratorOptions.name == undefined) decoratorOptions.name = IndependentUtils.camelToUnderscore(propertyKey);
        if(decoratorOptions.length == undefined) decoratorOptions.length = Mandarine.ORM.Defaults.ColumnDecoratorDefault.length;
        if(decoratorOptions.scale == undefined) decoratorOptions.scale = Mandarine.ORM.Defaults.ColumnDecoratorDefault.scale;
        if(decoratorOptions.precision == undefined) decoratorOptions.precision = Mandarine.ORM.Defaults.ColumnDecoratorDefault.precision;
        if(decoratorOptions.nullable == undefined) decoratorOptions.nullable = Mandarine.ORM.Defaults.ColumnDecoratorDefault.nullable;
        if(decoratorOptions.unique == undefined) decoratorOptions.unique = Mandarine.ORM.Defaults.ColumnDecoratorDefault.unique;

        decoratorOptions.fieldName = propertyKey;

        if(decoratorOptions && !decoratorOptions.type) {
            if(!propertyTypeName) {
                decoratorOptions.type = Types.VARCHAR;
            } else if(propertyTypeName === 'String' && decoratorOptions.type == (undefined || null)) {
                decoratorOptions.type = Types.VARCHAR;
            } else if(propertyTypeName === 'Boolean' && decoratorOptions.type == (undefined || null)) {
                decoratorOptions.type = Types.BOOLEAN;
            } else if(propertyTypeName == 'Number' && decoratorOptions.type == (undefined || null)) {
                decoratorOptions.type = Types.BIGINT;
            } else if(propertyTypeName == 'Object' && decoratorOptions.type == (undefined || null)) {
                const initialized = new (propertyType);
                switch(true) {
                    case initialized instanceof Date:
                        decoratorOptions.type = Types.DATE;
                    break;
                }
            }
        }

        let columnAnnotationMetadataKey: string = `${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN}:${decoratorOptions.name}`;

        if(!currentTargetAnnotations.some(metadataKeys => metadataKeys == columnAnnotationMetadataKey)) {
            Reflect.defineMetadata(columnAnnotationMetadataKey, decoratorOptions, targetClass);
        }
    }

    public static registerIdDecorator(targetClass: any, propertyKey: string) {
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${propertyKey}:primaryKey`, true, targetClass, propertyKey);
    }

    public static registerGeneratedValueDecorator(targetClass: any, decoratorOptions: Mandarine.ORM.Entity.Decorators.GeneratedValue, propertyKey: string) {
        Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${propertyKey}:generatedValue`, decoratorOptions, targetClass, propertyKey);
    }

}