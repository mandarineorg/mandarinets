// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";

/**
 * This class is one of the most important class for MQL
 * This class resolves the methods of your repository as it works as bridge between your repositories and Mandarine's Engine.
 */
export class PostgresRepositoryProxy<T> implements Mandarine.ORM.RepositoryProxy {

    private static readonly SUPPORTED_KEYWORDS = ["and", "or", "isnotnull", "isnull", "isempty", "isnotempty", "startingwith", "endswith", "like"];

    public entity: Mandarine.ORM.Entity.Table;

    constructor(entity: Mandarine.ORM.Entity.Table) {
        this.entity = entity;
    }

    public async executeQuery(query: any) {
        let dbClient: PostgresConnector = this.getEntityManager().getDatabaseClient();
        let connection = await (dbClient).makeConnection();
            try{
                let queryExecution = await dbClient.queryWithConnection(connection, query);
                let rowsOfObjects = await queryExecution.rowsOfObjects();
                if(rowsOfObjects.length == 0) {
                    return null;
                } else if(rowsOfObjects.length >= 1) {
                    return rowsOfObjects;
                }
            }catch(error){
                return undefined;
            }
    }

    public getEntityManager(): Mandarine.ORM.Entity.EntityManager {
        let entityManager: Mandarine.ORM.Entity.EntityManager = ApplicationContext.getInstance().getEntityManager();
        return entityManager;
    }

    public async save(model: any): Promise<any> {
        if(!ReflectUtils.checkClassInitialized(model)) throw new MandarineORMException(MandarineORMException.INSTANCE_IN_SAVE, "PostgresRepositoryProxy");
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let columns: Array<Mandarine.ORM.Entity.Column> = this.entity.columns;

        let modelObject: object = JSON.parse(JSON.stringify(model));
        Object.keys(modelObject).forEach((modelColumn) => {
            if(!columns.some(col => col.name.toLowerCase() == modelColumn.toLowerCase())) delete modelObject[modelColumn];
        });

        let dialect = entityManager.getDialectClass();

        if(this.entity.primaryKey == (undefined || null) || model[this.entity.primaryKey.fieldName] == (null || undefined)) {
            // INSERTION
                let insertionValues: Array<any> = new Array<any>();
                let queryData = dialect.insertStatement(dialect.getTableMetadata(this.entity), this.entity, modelObject, true);
                let query = queryData.query;
                let queryColumnValues = queryData.insertionValuesObject;
                Object.keys(queryColumnValues).forEach((col, index) => insertionValues.push(`$${index + 1}`));

                query = query.replace("%values%", insertionValues.join(", "));
                let saveQuery = await this.executeQuery({
                    text: query,
                    args: Object.values(queryColumnValues)
                });

                if(saveQuery === undefined) {
                    return false;
                } else {
                    return true;
                }
        } else {
            // UPDATE
                let updateValues: Array<any> = new Array<any>();
                let queryData = dialect.updateStatement(dialect.getTableMetadata(this.entity), this.entity, modelObject);
                let query = queryData.query;
                let queryColumnValues = queryData.updateValuesObject;
                Object.keys(queryColumnValues).forEach((col, index) => updateValues.push(`$${index + 1}`));
                query = query.replace("%values%", updateValues.join(", "));

                // Primary key value
                query = query.replace("%primaryKeyValue%", `$${updateValues.length + 1}`);
                // Query args
                let queryArgs = Object.values(queryColumnValues);
                queryArgs.push(model[this.entity.primaryKey.fieldName]);
                    
                let saveQuery = await this.executeQuery({
                    text: query,
                    args: queryArgs
                });

                if(saveQuery === undefined) {
                    return false;
                } else {
                    return true;
                }
        }

    }

    public async findAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.selectStatement(dialect.getTableMetadata(this.entity));
        return this.executeQuery(query);
    }

    public async countAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.selectAllCountStatement(dialect.getTableMetadata(this.entity));
        return (<any>await this.executeQuery(query))[0].count;
    }

    public async deleteAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.deleteStatement(dialect.getTableMetadata(this.entity));

        let deleteQuery = await this.executeQuery(query);

        if(deleteQuery === undefined) {
            return false;
        } else {
            return true;
        }
    }

    public lexicalProcessor(methodName: string, proxyType: Mandarine.ORM.ProxyType): string {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let dialect = entityManager.getDialectClass();
        let tableMetadata: Mandarine.ORM.Entity.TableMetadata = dialect.getTableMetadata(this.entity);

        let columnsNames = this.entity.columns.map(item => item.name.toLowerCase());
        methodName = methodName.replace(proxyType, "").toLowerCase();

        let mainQuery = "";

        switch(proxyType) {
            case "findBy":
                mainQuery += `${dialect.selectWhereStatement(tableMetadata)} `;
            break;
            case "countBy":
                mainQuery += `${dialect.selectAllCountWhereStatement(tableMetadata)} `;
            break;
            case "existsBy":
                mainQuery += `${dialect.selectAllCountWhereStatement(tableMetadata)} `;
            break;
            case "deleteBy":
                mainQuery += `${dialect.deleteWhereStatement(tableMetadata)} `;
            break;
        }

        let currentWord = "";

        let queryData: Array<string> = new Array<string>();

        let colSecureId = 1;
        const addOperator = (operator: string, last: boolean) => {
            switch(operator) {
                case "=":
                    queryData.push('=');
                    queryData.push(`$${colSecureId}`);
                    colSecureId++;
                break;

                case "and":
                case "or":
                    if(!last) queryData.push(operator);
                break;

                case "isnotnull":
                    queryData.push("IS NOT NULL");
                break;

                case "isnull":
                    queryData.push("IS NULL");
                break;

                case "isempty":
                    queryData.push("=");
                    queryData.push(`''`);
                break;

                case "isnotempty":
                    queryData.push("<>");
                    queryData.push(`''`);
                break;

                case "startingwith":
                    queryData.push('LIKE');
                    queryData.push(`'' || $${colSecureId} || '%'`);
                    colSecureId++;
                break;

                case "endswith":
                    queryData.push('LIKE');
                    queryData.push(`'%' || $${colSecureId} || ''`);
                    colSecureId++;
                break;

                case "like":
                    queryData.push('LIKE');
                    queryData.push(`'%' || $${colSecureId} || '%'`);
                    colSecureId++;
                break;

            }
        }

        const isColumn = (word: string): boolean => {
            return columnsNames.some(parameter => word == parameter);
        }

        const isOperator = (word: string): boolean => {
            return PostgresRepositoryProxy.SUPPORTED_KEYWORDS.some(keyword => keyword == word);
        };

        let processorLogic = [];

        for(let i = 0; i<methodName.length; i++) {
            currentWord += methodName.charAt(i);
            if(isColumn(currentWord)) {
                processorLogic.push(currentWord);
                currentWord = "";
            } else if(isOperator(currentWord)) {
                processorLogic.push(currentWord);
                currentWord = "";
            }
        }

        for(let i = 0; i<processorLogic.length; i++) {
            let iterator = { previous: processorLogic[i - 1], current: processorLogic[i], next: processorLogic[i + 1] };
            const { previous, current, next } = iterator;

            if(current && isColumn(current)) {
                queryData.push(current);
                if(next && isOperator(next)) {
                    if(next == 'and' || next == 'or') {
                        addOperator("=", false);
                    }
                    addOperator(next, false);
                }
                if(next == undefined && isOperator(previous) && (previous == 'and' || previous == 'or')) {
                    addOperator("=", false);
                }
            } else if(current && isOperator(current)) {
                if(previous && isColumn(previous) && next && isOperator(next)) {
                    addOperator(next, false);
                }
            }

            if(current && isColumn(current) && next == undefined && previous == undefined) {
                addOperator("=", false);
            }
        }

        mainQuery += queryData.join(" ");

        return mainQuery;
    }

    public async mainProxy(nativeMethodName: string, proxyType: Mandarine.ORM.ProxyType, args: Array<any>): Promise<any> {
        let mqlQuery: string = this.lexicalProcessor(nativeMethodName, proxyType);

       let query = this.executeQuery({
        text: mqlQuery,
        args: args
        });

        if(proxyType == "countBy") {
            return (await query)[0].count;
        } else if(proxyType == "existsBy") {
            return ((await query)[0].count) >= 1;
        } else {
            return query;
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