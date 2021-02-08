// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { lexicalProcessor } from "../core/lexicalProcessor.ts";

export class DefaultRepositoryProxy {

    public getEntityManager(): Mandarine.ORM.Entity.EntityManager {
        return ApplicationContext.getInstance().getEntityManager();
    }

    public lexicalProcessor(proxyObject: Mandarine.ORM.RepositoryProxy, methodName: string, proxyType: Mandarine.ORM.ProxyType): string {
        const dialect  = this.getEntityManager().getDialectClass();
        return lexicalProcessor(proxyObject, methodName, proxyType, (<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(proxyObject.entity), proxyObject.entity, (<Mandarine.ORM.Dialect.Dialect>dialect));
    }

    public async manualProxy(proxyObject: Mandarine.ORM.RepositoryProxy, query: String, secure: boolean, args: Array<any>) {
        if(secure != undefined && secure == true) {
            return proxyObject.executeQuery({
                text: query,
                args: args
            });
        } else {
            return proxyObject.executeQuery(query);
        }
    }

    public async deleteAll(proxyObject: Mandarine.ORM.RepositoryProxy) {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).deleteStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(proxyObject.entity));

        let deleteQuery = await proxyObject.executeQuery(query);

        return !(deleteQuery === undefined);
    }

    public async findAll(proxyObject: Mandarine.ORM.RepositoryProxy) {
        let entityManager: Mandarine.ORM.Entity.EntityManager = this.getEntityManager();

        let dialect = entityManager.getDialectClass();
        let query = (<Mandarine.ORM.Dialect.Dialect>dialect).selectStatement((<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(proxyObject.entity));
        return proxyObject.executeQuery(query);
    }
    
    public async mainProxy(proxyObject: Mandarine.ORM.RepositoryProxy, nativeMethodName: string, proxyType: Mandarine.ORM.ProxyType, args: Array<any>): Promise<any> {
        let mqlQuery: string = this.lexicalProcessor(proxyObject, nativeMethodName, proxyType);

       let query: any = proxyObject.executeQuery({
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

}