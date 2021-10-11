// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { PostgreSQLDialect } from "../dialect/postgreSQLDialect.ts";
import { EntityRegistry } from "../entity-registry/entityRegistry.ts";
import { MandarineORMException } from "./exceptions/mandarineORMException.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MysqlConnector } from "../connectors/mysqlConnector.ts";
import { MysqlDialect } from "../dialect/mysqlDialect.ts";

/**
 * This class represents the entity manager which contains all the necessary methods & references for Mandarine to interact with your database.
 * This class handles the creation of new entities or new columns in entities as well as the interaction with your application and MQL
 */
export class EntityManagerClass {

    private dialectClass: Mandarine.ORM.Dialect.Dialect | undefined = undefined;
    private dialect: Mandarine.ORM.Dialect.Dialects | undefined = undefined;
    public entityRegistry: EntityRegistry;
    private databaseClient: any | PostgresConnector | MysqlConnector;
    private fullyInitialized: boolean = false;

    public logger: Log = Log.getLogger(Mandarine.ORM.Entity.EntityManager);

    constructor() {
        this.entityRegistry = new EntityRegistry();
    }

    public async initializeAllEntities() {
        let entities: Array<Mandarine.ORM.Entity.Table> = this.entityRegistry.getAllEntities();
        
        let dialect: Mandarine.ORM.Dialect.Dialect | undefined = this.dialectClass;
        let dialectType = this.getDialect();

        if(dialect) {
            // CREATE TABLES
            let tableQueries: Array<string> = new Array<string>();
            entities.forEach((table) => {
                let tableMetadata: Mandarine.ORM.Entity.TableMetadata = (<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(table);
                let entityCreationQuery: string | undefined;

                if (dialectType === Mandarine.ORM.Dialect.Dialects.MYSQL) {
                    entityCreationQuery = (<Mandarine.ORM.Dialect.Dialect>dialect).createTable(tableMetadata, table.columns, true);
                } else if(dialectType === Mandarine.ORM.Dialect.Dialects.POSTGRESQL) {
                    entityCreationQuery = (<Mandarine.ORM.Dialect.Dialect>dialect).createTable(tableMetadata, undefined, true);
                }
                if(entityCreationQuery) {
                    tableQueries.push(entityCreationQuery);
                }
            });

            let columnQueries: Array<string> = new Array<string>();
            entities.forEach((table) => {
                let tableMetadata: Mandarine.ORM.Entity.TableMetadata = (<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(table);
                let entityColumnsInitializationQuery = "";

                if(table.columns != (null || undefined)) {
                    table.columns.forEach((col) => {
                        entityColumnsInitializationQuery += (<Mandarine.ORM.Dialect.Dialect>dialect).addColumn(tableMetadata, col);
                    });
                }

                if(entityColumnsInitializationQuery != "") {
                    columnQueries.push(entityColumnsInitializationQuery);
                }
            });

            // CREATE PRIMARY KEY AND UNIQUE CONSTRAINTS FOR THE COLUMNS IN TABLE
            let constraintQueries: Array<string> = new Array<string>();
            entities.forEach((table) => {
                let tableMetadata: Mandarine.ORM.Entity.TableMetadata = (<Mandarine.ORM.Dialect.Dialect>dialect).getTableMetadata(table);

                let entityPrimaryKeyConstraintsQuery = "";

                if(table.primaryKey != (null || undefined)) {
                    entityPrimaryKeyConstraintsQuery += (<Mandarine.ORM.Dialect.Dialect>dialect).addPrimaryKey(tableMetadata, table.primaryKey);
                }

                if(table.uniqueConstraints != (null || undefined)) {
                    table.uniqueConstraints.forEach((uniqueConstraint: Mandarine.ORM.Entity.Column) => {
                        entityPrimaryKeyConstraintsQuery += (<Mandarine.ORM.Dialect.Dialect>dialect).addUniqueConstraint(tableMetadata, uniqueConstraint);
                    })
                }

                if(entityPrimaryKeyConstraintsQuery != "") {
                    constraintQueries.push(entityPrimaryKeyConstraintsQuery);
                }
            });

            const [tableQueriesFinal, columnQueriesFinal, constraintQueriesFinal] = [tableQueries.join(" "), columnQueries.join(" "), constraintQueries.join(" ")]
            
            switch(this.getDialect()) {
                case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                    try {
                        let connection: any = await (<PostgresConnector>this.databaseClient).makeConnection();
                        if(connection) {
                            await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, tableQueries.join(" "));
                            await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, columnQueries.join(" "));
                            await Promise.all(constraintQueries.map(async (item) => {
                                try {
                                    await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, item, true);
                                } catch (error) {
                                    this.logger.debug("Ignoring creation of constraint: ", error.message);
                                }
                            }));
                            connection = null;
                        }
                    }catch(error){
                    }
                break;
                case Mandarine.ORM.Dialect.Dialects.MYSQL:
                    try{
                        const client: MysqlConnector = this.databaseClient;
                        await (client).execute(`CREATE DATABASE IF NOT EXISTS ${client.currentDatabase}`);
                        await (client).execute(`USE ${client.currentDatabase}`);
                        await (client).query(tableQueriesFinal);
                        await Promise.all(columnQueries.map(async (item) => {
                            try {
                                await client.execute(item);
                            } catch {
                            }
                        }));
                        await Promise.all(constraintQueries.map(async (item) => {
                            try {
                                await client.execute(item);
                            } catch {
                            }
                        }));
                    }catch(error){
                        // Initialization errors should not be shown
                    }
                break;
            }

            if(ApplicationContext.CONTEXT_METADATA.engineMetadata?.orm) {
                ApplicationContext.CONTEXT_METADATA.engineMetadata.orm.dbEntitiesAmount = entities.length;
            }
        }
    }

    public getDataSource(): any {
        return Mandarine.Global.getMandarineConfiguration().mandarine.dataSource;
    }

    public initializeEssentials(): void {
        if(this.fullyInitialized) return;

        let dataSource = this.getDataSource();
        let dialect: Mandarine.ORM.Dialect.Dialects = dataSource.dialect;

        switch(dialect) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                if(this.dialectClass == undefined || null) {
                    this.dialectClass = new PostgreSQLDialect();
                    this.databaseClient = new PostgresConnector(dataSource.data.host, dataSource.data.username, dataSource.data.password, dataSource.data.database, dataSource.data.port, dataSource.data.poolSize);
                }
            break;
            case Mandarine.ORM.Dialect.Dialects.MYSQL:
                if(this.dialectClass == undefined || null) {
                    this.dialectClass = new MysqlDialect();
                    this.databaseClient = new MysqlConnector({
                        hostname: dataSource.data.host, 
                        username: dataSource.data.username, 
                        password: dataSource.data.password, 
                        db: dataSource.data.database, 
                        port: dataSource.data.port, 
                        poolSize: dataSource.data.poolSize
                    });
                }
            break;
            default:
                throw new MandarineORMException(MandarineORMException.UNKNOWN_DIALECT, "Entity Manager");
            break;
        }
        this.fullyInitialized = true;
        this.dialect = dialect;
    }

    public getDatabaseClient() {
        return this.databaseClient;
    }

    public getDialect() {
        return this.dialect;
    }

    public getDialectClass() {
        return this.dialectClass;
    }


}