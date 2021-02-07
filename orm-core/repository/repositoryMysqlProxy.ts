// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { MysqlConnector } from "../connectors/mysqlConnector.ts";
import type { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";
import { lexicalProcessor } from "../core/lexicalProcessor.ts";

/**
 * This class is one of the most important class for MQL
 * This class resolves the methods of your repository as it works as bridge between your repositories and Mandarine's Engine.
 */
export class MysqlRepositoryProxy<T> implements Mandarine.ORM.RepositoryProxy {

    public readonly SUPPORTED_KEYWORDS = ["and", "or", "isnotnull", "isnull", "isempty", "isnotempty", "startingwith", "endswith", "like", "greaterthan", "lessthan"];

    public entity: Mandarine.ORM.Entity.Table;

    private logger: Log = Log.getLogger("MysqlRepositoryProxy");

    constructor(entity: Mandarine.ORM.Entity.Table) {
        this.entity = entity;
    }

    public async executeQuery(query: any) {

        query = (CommonUtils.isObject(query)) ? query : {
            text: query,
            args: []
        };

        let dbClient: MysqlConnector = this.getEntityManager().getDatabaseClient();
            try{
                const queryExecution = await dbClient.query(query.text, query.args);
                if(!queryExecution) {
                    this.logger.debug("Query execution returned null and operation was aborted");
                    return null;
                }
                
                return queryExecution;
            }catch(error){
                console.log(query, error);
                return undefined;
            }
    }

    public getEntityManager(): Mandarine.ORM.Entity.EntityManager {
        return ApplicationContext.getInstance().getEntityManager();
    }

    public async save(model: any): Promise<any> {
        if(!ReflectUtils.checkClassInitialized(model)) throw new MandarineORMException(MandarineORMException.INSTANCE_IN_SAVE, "MysqlRepositoryProxy");
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let columns: Array<Mandarine.ORM.Entity.Column> = this.entity.columns;

        let modelObject: { [name: string] : any } = JSON.parse(JSON.stringify(model));
        Object.keys(modelObject).forEach((modelColumn) => {
            if(!columns.some(col => col.name?.toLowerCase() == modelColumn.toLowerCase())) delete modelObject[modelColumn];
        });

        let dialect = entityManager.getDialectClass();

        const primaryKey = this.entity.primaryKey;

        let saveQuery;
        let parameterizedData: Array<any> = new Array<any>()
        if(primaryKey == (undefined || null) || (primaryKey.fieldName != undefined && model[primaryKey.fieldName] == (null || undefined))) {
            // INSERTION
                let { query, insertionValuesObject: queryColumnValues } = (<Mandarine.ORM.Dialect.Dialect>dialect).insertStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity), this.entity, modelObject, true);
                Object.keys(queryColumnValues).forEach(() => parameterizedData.push("?"));

                query = query.replace("%values%", parameterizedData.join(", "));
                saveQuery = await this.executeQuery({
                    text: query,
                    args: Object.values(queryColumnValues)
                });
        } else {
            // UPDATE
                let { query, updateValuesObject: queryColumnValues }  = (<Mandarine.ORM.Dialect.Dialect>dialect).updateStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity), this.entity, modelObject);
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

    public async findAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).selectStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity));
        return this.executeQuery(query);
    }

    public async countAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).selectAllCountStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity));
        const queryExec = await this.executeQuery(query);
        return parseFloat(queryExec[0]["COUNT(*)"]);
    }

    public async deleteAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).deleteStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity));

        let deleteQuery = await this.executeQuery(query);

        if(deleteQuery === undefined) {
            return false;
        } else {
            return true;
        }
    }

    public lexicalProcessor(methodName: string, proxyType: Mandarine.ORM.ProxyType): string {
        const dialect  = this.getEntityManager().getDialectClass();
        return lexicalProcessor(this, methodName, proxyType, (<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(this.entity), this.entity, (<Mandarine.ORM.Dialect.Dialect>dialect));
    }

    public async mainProxy(nativeMethodName: string, proxyType: Mandarine.ORM.ProxyType, args: Array<any>): Promise<any> {
        let mqlQuery: string = this.lexicalProcessor(nativeMethodName, proxyType);

       let query: any = this.executeQuery({
            text: mqlQuery,
            args: args
        });

        if(query) {
            if(proxyType == "countBy") {
                return parseFloat((await query)[0]?.count || 0);
            } else if(proxyType == "existsBy") {
                return ((await query)[0].count) >= 1;
            } else {
                return query;
            }
        }
    }

    public async manualProxy(query: String, secure: boolean, args: Array<any>) {
            if(secure != undefined && secure == true) {
                return this.executeQuery({
                    text: query,
                    args: args
                });
            } else {
                return this.executeQuery(query);
            }
    }

}