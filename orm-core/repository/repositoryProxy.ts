import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { PostgreSQLDialect } from "../dialect/postgreSQLDialect.ts";
import { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";

/**
 * This class is one of the most important class for MQL
 * This class resolves the methods of your repository as it works as bridge between your repositories and Mandarine's Engine.
 */
export class RepositoryProxy<T> {

    private static readonly SUPPORTED_KEYWORDS = ["and", "or"];

    public entity: Mandarine.ORM.Entity.Table;

    constructor(entity: Mandarine.ORM.Entity.Table) {
        this.entity = entity;
    }

    private getQueryKeysValues(repositoryMethodParameterNames: Array<string>, args: Array<any>) {
        let values: object = {};
        repositoryMethodParameterNames.forEach((item, index) => {
            values[item] = args[index];
        });
        return values;
    }

    private async executeQuery(query: any, entityManager: Mandarine.ORM.Entity.EntityManager) {
        switch(entityManager.getDialect()) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
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
            break;
        }
    }

    public getEntityManager(): Mandarine.ORM.Entity.EntityManager {
        let entityManager: Mandarine.ORM.Entity.EntityManager = ApplicationContext.getInstance().getEntityManager();
        return entityManager;
    }

    public async save(repositoryMethodParameterNames: Array<string>, model: any): Promise<any> {
        if(!ReflectUtils.checkClassInitialized(model)) {/*TODO THROW ERROR*/}

        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let columns: Array<Mandarine.ORM.Entity.Column> = this.entity.columns;
        let modelObject: object = JSON.parse(JSON.stringify(model));

        Object.keys(modelObject).forEach((modelColumn) => {
            if(!columns.some(col => col.name.toLowerCase() == modelColumn.toLowerCase())) delete modelObject[modelColumn];
        });

        let dialect = entityManager.getDialectClass();

        switch(entityManager.getDialect()) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                let insertionValues: Array<any> = new Array<any>();
                let queryData = dialect.insertStatement(dialect.getTableMetadata(this.entity), this.entity, modelObject, true);
                let query = queryData.query;
                let queryColumnValues = queryData.insertionValuesObject;
                Object.keys(queryColumnValues).forEach((col, index) => {
                    insertionValues.push(`$${index + 1}`);
                });
                query = query.replace("%values%", insertionValues.join(", "));

                let saveQuery = await this.executeQuery({
                    text: query,
                    args: Object.values(queryColumnValues)
                }, entityManager);

                if(saveQuery === undefined) {
                    return false;
                } else {
                    return true;
                }

            break;
        }

    }

    public async findAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.selectStatement(dialect.getTableMetadata(this.entity));
        return this.executeQuery(query, entityManager);
    }

    public async countAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.selectAllCountStatement(dialect.getTableMetadata(this.entity));
        return (<any>await this.executeQuery(query, entityManager))[0].count;
    }

    public async deleteAll() {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = dialect.deleteStatement(dialect.getTableMetadata(this.entity));

        let deleteQuery = await this.executeQuery(query, entityManager);

        if(deleteQuery === undefined) {
            return false;
        } else {
            return true;
        }
    }

    private lexicalProcessor(methodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy" | "countBy") {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        let dialect = entityManager.getDialectClass();
        let tableMetadata: Mandarine.ORM.Entity.TableMetadata = dialect.getTableMetadata(this.entity);

        repositoryMethodParameterNames = repositoryMethodParameterNames.map(item => item.toLowerCase());
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
        let previousColumn = "";
        let previousOperator = "";

        let queryData: Array<string> = new Array<string>();

        const addOperator = (operator: string, columnVal: string, last: boolean) => {
            switch(operator) {
                case "=":
                    queryData.push('=');
                    queryData.push(`'%${columnVal}%'`);
                break;

                case "and":
                case "or":
                    previousOperator = operator;
                    queryData.push('=');
                    queryData.push(`'%${columnVal}%'`);

                    if(!last) queryData.push(operator);
                break;
            }
        }

        for(let i = 0; i<methodName.length; i++) {
            currentWord += methodName.charAt(i);

            if(repositoryMethodParameterNames.some(parameter => currentWord == parameter)) {
                queryData.push(currentWord);
                previousColumn = currentWord;
                currentWord = "";
            } else if(RepositoryProxy.SUPPORTED_KEYWORDS.some(keyword => keyword == currentWord)) {

                addOperator(currentWord, previousColumn, false);

                previousColumn = "";
                currentWord = "";
            }
        }

        if(previousOperator == "") {
            previousOperator = "=";
        }

        addOperator(previousOperator, previousColumn, true);

        mainQuery += queryData.join(" ");

        return mainQuery;
    }

    public async mainProxy(nativeMethodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy" | "countBy", args: Array<any>): Promise<any> {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let values: object = this.getQueryKeysValues(repositoryMethodParameterNames.map(item => item.toLowerCase()), args);
        let mqlQuery: string = this.lexicalProcessor(nativeMethodName, repositoryMethodParameterNames, proxyType);
        
        Object.keys(values).forEach((valueKey, index) => {
            switch(entityManager.getDialect()) {
                case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                    mqlQuery = mqlQuery.replace(`'%${valueKey}%'`, `$${index + 1}`);
                break;
            }
        });

       let query = this.executeQuery({
        text: mqlQuery,
        args: args
        }, entityManager);

        if(proxyType == "countBy") {
            return (await query)[0].count;
        } else if(proxyType == "existsBy") {
            return ((await query)[0].count) >= 1;
        } else {
            return query;
        }
    }

    public async manualProxy(query: String, secure: boolean, args: Array<any>) {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();
        switch(entityManager.getDialect()) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                if(secure != undefined && secure == true) {
                    return this.executeQuery({
                        text: query,
                        args: args
                    }, entityManager);
                } else {
                    return this.executeQuery(query, entityManager);
                }
                break;
        }
    }

}