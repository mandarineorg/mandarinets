import { EntityRegistry } from "../entity-registry/entityRegistry.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { PostgreSQLDialect } from "../dialect/postgreSQLDialect.ts";
import { PostgresConnector } from "../connectors/postgreSQLConnector.ts";
import { MandarineORMException } from "./exceptions/mandarineORMException.ts";
import { Log } from "../../logger/log.ts";

/**
 * This class represents the entity manager which contains all the necessary methods & references for Mandarine to interact with your database.
 * This class handles the creation of new entities or new columns in entities as well as the interaction with your application and MQL
 */
export class EntityManagerClass {

    private dialectClass: Mandarine.ORM.Dialect.Dialect;
    private dialect: Mandarine.ORM.Dialect.Dialects;
    public entityRegistry: EntityRegistry;
    private databaseClient: any | PostgresConnector;
    private fullyInitialized: boolean = false;

    public logger: Log = Log.getLogger(Mandarine.ORM.Entity.EntityManager);

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
                try {
                    let connection = await (<PostgresConnector>this.databaseClient).makeConnection();
                    await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, tableQueries.join(" "));
                    await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, columnQueries.join(" "));
                    await (<PostgresConnector>this.databaseClient).queryWithConnection(connection, constraintQueries.join(" "));
                    connection = null;
                }catch(error){
                }
            break;
        }

        if(entities.length > 0) {
            this.logger.info(`A total of ${entities.length} database entities have been found`);
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