import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";

export class RepositoryProxy<T> {

    private static readonly SUPPORTED_KEYWORDS = ["and", "or"];

    public currentDialect: Mandarine.ORM.Dialect.Dialect;
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

    public save(repositoryMethodParameterNames: Array<string>, args: Array<any>): any {
        // let entityManager = ApplicationContext.getInstance().getEntityManager();
        // let values: object = this.getQueryKeysValues(repositoryMethodParameterNames.map(item => item.toLowerCase()), args);
        // let query = entityManager.queryBuilder.query().mpqlInsertStatement(repositoryMethodParameterNames, args).replace('%table%', this.tableReferenceName);

        // switch(entityManager.dialect) {
        //     case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
        //         return entityManager.getDatabaseConnector().query({
        //             text: query,
        //             args: args
        //         });
        //     break;
        // }
    }

    public findAll(): any {
        console.log("find all called proxy");
        // let entityManager = ApplicationContext.getInstance().getEntityManager();
        // let query = entityManager.queryBuilder.query().mpqlSelectAllStatement().replace('%table%', this.tableReferenceName);

        // switch(entityManager.dialect) {
        //     case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
        //         return entityManager.getDatabaseConnector().query(`${query}`);
        //     break;
        // }
    }

    public deleteAll(): any {
        let entityManager = ApplicationContext.getInstance().getEntityManager();
        // let query = entityManager.queryBuilder.query().mpqlDeleteAllStatement().replace('%table%', this.tableReferenceName);

        // switch(entityManager.dialect) {
        //     case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
        //         return entityManager.getDatabaseConnector().query(`${query}`);
        //     break;
        // }
    }

    private lexicalProcessor(methodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy") {
        // repositoryMethodParameterNames = repositoryMethodParameterNames.map(item => item.toLowerCase());
        // methodName = methodName.replace(proxyType, "").toLowerCase();

        // let mainQuery = "";

        // switch(proxyType) {
        //     case "findBy":
        //         mainQuery += `${this.currentDialect.mqlSelectStatement()} `;
        //     break;
        //     case "existsBy":
        //         mainQuery += `${this.currentDialect.mqlSelectCountStatement()} `;
        //     break;
        //     case "deleteBy":
        //         mainQuery += `${this.currentDialect.mpqlDeleteStatement()} `;
        //     break;
        // }

        // let currentWord = "";
        // for(let i = 0; i<methodName.length; i++) {
        //     currentWord += methodName.charAt(i);

        //     if(repositoryMethodParameterNames.some(parameter => currentWord == parameter)) {
        //         mainQuery += `${this.currentDialect.mpqlSelectColumnSyntax(currentWord)} `;
        //         currentWord = "";
        //     } else if(RepositoryProxy.SUPPORTED_KEYWORDS.some(keyword => keyword == currentWord)) {
        //         mainQuery += `${currentWord} `;
        //         currentWord = "";
        //     }

        // }

        // return mainQuery;
    }

    public mainProxy(nativeMethodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy", args: Array<any>): any {
        // let values: object = this.getQueryKeysValues(repositoryMethodParameterNames.map(item => item.toLowerCase()), args);
        // let mqlQuery: string = this.lexicalProcessor(nativeMethodName, repositoryMethodParameterNames, proxyType);
        
        // Object.keys(values).forEach((valueKey, index) => {
        //     mqlQuery = mqlQuery.replace(`'%${valueKey}%'`, `$${index + 1}`);
        // });

        // mqlQuery = mqlQuery.replace("%table%", this.tableReferenceName);
        
        // let entityManager = ApplicationContext.getInstance().getEntityManager();
        // switch(entityManager.dialect) {
        //     case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
        //         return entityManager.getDatabaseConnector().query({
        //             text: mqlQuery + ";",
        //             args: args
        //         });
        //     break;
        // }
    }

}