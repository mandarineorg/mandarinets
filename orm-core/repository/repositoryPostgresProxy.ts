// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import type { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";
import { lexicalProcessor } from "../core/lexicalProcessor.ts";
import { DefaultRepositoryProxy } from "./defaultRepositoryProxy.ts";

/**
 * This class is one of the most important class for MQL
 * This class resolves the methods of your repository as it works as bridge between your repositories and Mandarine's Engine.
 */
export class PostgresRepositoryProxy<T> extends DefaultRepositoryProxy implements Mandarine.ORM.RepositoryProxy {

    public readonly SUPPORTED_KEYWORDS = ["and", "or", "isnotnull", "isnull", "isempty", "isnotempty", "startingwith", "endswith", "like", "greaterthan", "lessthan"];

    public entity: Mandarine.ORM.Entity.Table;

    private logger: Log = Log.getLogger("PostgresRepositoryProxy");

    constructor(entity: Mandarine.ORM.Entity.Table) {
        super()
        this.entity = entity;
    }

    public async executeQuery(query: any) {
        let dbClient: PostgresConnector = this.getEntityManager().getDatabaseClient();
            try{
                let queryExecution = await dbClient.query(query);
                if(!queryExecution) {
                    this.logger.debug("Query execution returned null and operation was aborted");
                    return null;
                }
                let rowsOfObjects = queryExecution.rows;
                if(rowsOfObjects.length == 0) {
                    return [];
                } else if(rowsOfObjects.length >= 1) {
                    return rowsOfObjects;
                }

            }catch(error){
                this.logger.error(error);
                return undefined;
            }
    }

    public async save(model: any): Promise<any> {
        if(!ReflectUtils.checkClassInitialized(model)) throw new MandarineORMException(MandarineORMException.INSTANCE_IN_SAVE, "PostgresRepositoryProxy");
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let columns: Array<Mandarine.ORM.Entity.Column> = this.entity.columns;

        let modelObject: { [name: string] : any } = JSON.parse(JSON.stringify(model));
        Object.keys(modelObject).forEach((modelColumn) => {
            if(!columns.some(col => col.name?.toLowerCase() == modelColumn.toLowerCase())) delete modelObject[modelColumn];
        });

        let dialect: Mandarine.ORM.Dialect.Dialect = entityManager.getDialectClass()!;

        const primaryKey = this.entity.primaryKey;

        let saveQuery;
        let parameterizedData: Array<any> = new Array<any>();
        if(primaryKey == (undefined || null) || (primaryKey.fieldName != undefined && model[primaryKey.fieldName] == (null || undefined))) {
            // INSERTION
                let { query, insertionValuesObject: queryColumnValues } = (dialect).insertStatement((dialect).getTableMetadata(this.entity), this.entity, modelObject, true);
                Object.keys(queryColumnValues).forEach((col, index) => parameterizedData.push(`$${index + 1}`));

                query = query.replace("%values%", parameterizedData.join(", "));
                saveQuery = await this.executeQuery({
                    text: query,
                    args: Object.values(queryColumnValues)
                });
        } else {
            // UPDATE
                let { query, updateValuesObject: queryColumnValues } = (dialect).updateStatement((dialect).getTableMetadata(this.entity), this.entity, modelObject);
                Object.keys(queryColumnValues).forEach((col, index) => parameterizedData.push(`$${index + 1}`));
                query = query.replace("%values%", parameterizedData.join(", "));

                // Primary key value
                query = query.replace("%primaryKeyValue%", `$${parameterizedData.length + 1}`);
                // Query args
                let queryArgs = Object.values(queryColumnValues);
                queryArgs.push(model[<string> primaryKey.fieldName]);
                    
                saveQuery = await this.executeQuery({
                    text: query,
                    args: queryArgs
                });
        }

        return !(saveQuery === undefined);

    }

    public async countAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).selectAllCountStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity));
        return parseFloat((<any>await this.executeQuery(query))[0]?.count || 0);
    }

}