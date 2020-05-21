import { EntityRegistry } from "../entity-registry/entityRegistry.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";
import { PostgreSQLDialect } from "../dialect/postgreSQLDialect.ts";

export class EntityManagerClass {

    @Value('mandarine.dataSource.dialect')
    private dialect: Mandarine.ORM.Dialect.Dialects;

    @Value('mandarine.dataSource.data')
    private dataSourceData: any;

    public dialectClass: Mandarine.ORM.Dialect.Dialect;

    public entityRegistry: EntityRegistry;

    constructor() {
        switch(this.dialect) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                this.dialectClass = new PostgreSQLDialect();
            break;
            default:
                // TODO THROW ERROR
            break;
        }
        this.entityRegistry = new EntityRegistry();
    }

    public async initializeAllEntities() {
        let entities: Array<Mandarine.ORM.Entity.Table> = this.entityRegistry.getAllEntities();
        let queries: Array<string> = new Array<string>();

        // CREATE TABLES
        entities.forEach((table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.dialectClass.getTableMetadata(table);

            let entityCreationQuery = this.dialectClass.createTable(tableMetadata, undefined, true);

            queries.push(entityCreationQuery);
        });


        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.dialectClass.getTableMetadata(table);
            let entityColumnsInitializationQuery = "";

            if(table.columns != (null || undefined)) {
                table.columns.forEach((col) => {
                    entityColumnsInitializationQuery += this.dialectClass.addColumn(tableMetadata, col);
                });
            }

            if(entityColumnsInitializationQuery != "") {
                queries.push(entityColumnsInitializationQuery);
            }
        });

        // CREATE PRIMARY KEY AND UNIQUE CONSTRAINTS FOR THE COLUMNS IN TABLE
        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.dialectClass.getTableMetadata(table);

            let entityPrimaryKeyConstraintsQuery = "";

            if(table.primaryKey != (null || undefined)) {
                entityPrimaryKeyConstraintsQuery += this.dialectClass.addPrimaryKey(tableMetadata, table.primaryKey);
            }

            if(table.uniqueConstraints != (null || undefined)) {
                table.uniqueConstraints.forEach((uniqueConstraint: Mandarine.ORM.Entity.Column) => {
                    entityPrimaryKeyConstraintsQuery += this.dialectClass.addUniqueConstraint(tableMetadata, uniqueConstraint);
                })
            }

            if(entityPrimaryKeyConstraintsQuery != "") {
                queries.push(entityPrimaryKeyConstraintsQuery);
            }
        });
    }
}