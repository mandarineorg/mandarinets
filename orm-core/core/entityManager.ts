import { EntityRegistry } from "../entity-registry/entityRegistry.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";
import { PostgreSQLDialect } from "../dialect/postgreSQLDialect.ts";
import { PostgresConnector } from "../connectors/postgreSQLConnector.ts";

export class EntityManagerClass {

    private dialectClass: Mandarine.ORM.Dialect.Dialect;
    private dialect: Mandarine.ORM.Dialect.Dialects;
    public entityRegistry: EntityRegistry;
    private databaseClient: any | PostgresConnector;
    private fullyInitialized: boolean = false;

    constructor() {
        this.entityRegistry = new EntityRegistry();
    }

    public async initializeAllEntities() {
        let entities: Array<Mandarine.ORM.Entity.Table> = this.entityRegistry.getAllEntities();
        let dialect: Mandarine.ORM.Dialect.Dialect = this.dialectClass;
        // CREATE TABLES
        let tableQueries: Array<string> = new Array<string>();
        entities.forEach((table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = dialect.getTableMetadata(table);

            let entityCreationQuery = dialect.createTable(tableMetadata, undefined, true);

            tableQueries.push(entityCreationQuery);
        });

        let columnQueries: Array<string> = new Array<string>();
        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = dialect.getTableMetadata(table);
            let entityColumnsInitializationQuery = "";

            if(table.columns != (null || undefined)) {
                table.columns.forEach((col) => {
                    entityColumnsInitializationQuery += dialect.addColumn(tableMetadata, col);
                });
            }

            if(entityColumnsInitializationQuery != "") {
                columnQueries.push(entityColumnsInitializationQuery);
            }
        });

        // CREATE PRIMARY KEY AND UNIQUE CONSTRAINTS FOR THE COLUMNS IN TABLE
        let constraintQueries: Array<string> = new Array<string>();
        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = dialect.getTableMetadata(table);

            let entityPrimaryKeyConstraintsQuery = "";

            if(table.primaryKey != (null || undefined)) {
                entityPrimaryKeyConstraintsQuery += dialect.addPrimaryKey(tableMetadata, table.primaryKey);
            }

            if(table.uniqueConstraints != (null || undefined)) {
                table.uniqueConstraints.forEach((uniqueConstraint: Mandarine.ORM.Entity.Column) => {
                    entityPrimaryKeyConstraintsQuery += dialect.addUniqueConstraint(tableMetadata, uniqueConstraint);
                })
            }

            if(entityPrimaryKeyConstraintsQuery != "") {
                constraintQueries.push(entityPrimaryKeyConstraintsQuery);
            }
        });

        switch(this.getDialect()) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                let connection = await (<PostgresConnector>this.databaseClient).makeConnection();
                (<PostgresConnector>this.databaseClient).queryWithConnection(connection, tableQueries.join(" "));
                (<PostgresConnector>this.databaseClient).queryWithConnection(connection, columnQueries.join(" "));
                (<PostgresConnector>this.databaseClient).queryWithConnection(connection, constraintQueries.join(" "));
                connection = null;
            break;
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
            default:
                // TODO THROW ERROR
            break;
        }
        this.fullyInitialized = true;
        this.dialect = dialect;
    }

    public getDatabaseClient() {
        this.initializeEssentials();
        return this.databaseClient;
    }

    public getDialect() {
        this.initializeEssentials();
        return this.dialect;
    }

    public getDialectClass() {
        this.initializeEssentials();
        return this.dialectClass;
    }


}