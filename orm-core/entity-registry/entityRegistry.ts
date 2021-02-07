// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineConstants } from "../../main-core/mandarineConstants.ts";
import { Reflect } from "../../main-core/reflectMetadata.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { Mandarine } from "../../mod.ts";

/**
 * This class represents the registry where all the entities are added in order for mandarine to work with them at and after mandarine compile time.
 */
export class EntityRegistry {
    private entities: Map<string, Mandarine.ORM.Entity.Table> = new Map<string, Mandarine.ORM.Entity.Table>();

    public register(tableName: string, instance: any, schemaName?: string) {

        if(tableName == (null || undefined)) tableName = ReflectUtils.getClassName(instance);

        tableName = tableName.toLowerCase();

        const entityName = this.getEntityName(tableName, schemaName);
        
        if(this.entities.get(entityName) == (null || undefined)) {

            let columns = this.getColumnsFromEntity(instance);

            this.entities.set(entityName, {
                tableName: tableName,
                schema: this.getDefaultSchema(schemaName),
                columns: columns,
                uniqueConstraints: columns.filter((item) => item.unique == true),
                primaryKey: <Mandarine.ORM.Entity.Column> columns.find(item => item.options.primaryKey != undefined && item.options.primaryKey == true),
                instance: instance,
                className: ReflectUtils.getClassName(instance)
            });

        }
    }

    public getDefaultSchema(schema?: string): string {
        const dataSource = Mandarine.Global.getMandarineConfiguration().mandarine?.dataSource;
        const dialect: Mandarine.ORM.Dialect.Dialects = dataSource?.dialect;
        switch(dialect) {
            case Mandarine.ORM.Dialect.Dialects.MYSQL:
                return schema || dataSource.data?.database || "";
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                return schema || "public";
            default:
                // @ts-ignore
                return schema;
        }
    }

    public getEntityName(table: string, schema?: string): string {
        const dialect: Mandarine.ORM.Dialect.Dialects = Mandarine.Global.getMandarineConfiguration().mandarine?.dataSource?.dialect;
        schema = this.getDefaultSchema(schema);
        
        switch(dialect) {
            case Mandarine.ORM.Dialect.Dialects.MYSQL:
                return table;
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                return `${schema || "public"}.${table}`;
        }
    }

    public getEntity(schema: string, table: string) {
        return this.entities.get(this.getEntityName(table, schema));
    }

    public getColumnsFromEntity(entityInstance: any): Array<Mandarine.ORM.Entity.Decorators.Column> {
        let columns: Array<Mandarine.ORM.Entity.Decorators.Column> = new Array<Mandarine.ORM.Entity.Decorators.Column>();
        let initializedInstance: any = new entityInstance();

        let reflectEntityMetadataKeys = Reflect.getMetadataKeys(initializedInstance);

        if(reflectEntityMetadataKeys != undefined) {
            let reflectEntityColumnsMetadataKeys = reflectEntityMetadataKeys.filter((item: string) => item.startsWith(`${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN}:`));
            
            reflectEntityColumnsMetadataKeys.forEach((metadataKey: string) => {
                let columnData: Mandarine.ORM.Entity.Decorators.Column = Reflect.getMetadata(metadataKey, initializedInstance);
                if(columnData.options == undefined) columnData.options = {};

                var columnProperties = Reflect.getMetadataKeys(initializedInstance, <string> columnData.fieldName);

                let primaryKeyMetadataKey = `${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${columnData.fieldName}:primaryKey`;
                let generatedValueMetadataKey = `${MandarineConstants.REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY}:${columnData.fieldName}:generatedValue`;

                if(columnProperties.some(item => item == primaryKeyMetadataKey)) {
                    columnData.nullable = false;
                    columnData.unique = true;
                    columnData.options.primaryKey = true;
                }

                if(columnProperties.some(item => item == generatedValueMetadataKey)) {
                    columnData.options.generatedValue = Reflect.getMetadata(generatedValueMetadataKey, initializedInstance, <string> columnData.fieldName);
                    columnData.incrementStrategy = true;
                }

                columns.push(columnData);
            });
        }

        return columns;
    }

    public getAllEntities(): Array<Mandarine.ORM.Entity.Table> {
        return Array.from(this.entities.values());
    }

    public findEntityByInstanceType(initializedInstance: any): Mandarine.ORM.Entity.Table | undefined {
        return this.getAllEntities().find(item => (ReflectUtils.checkClassInitialized(initializedInstance) ? initializedInstance : new initializedInstance()) instanceof item.instance);
    }

}