import { Types } from "./sql/types.ts";
import { EntityManagerClass } from "./core/entityManager.ts";

/**
 * Contains all the essentials for Mandarine's ORM to work.
 */
export namespace MandarineORM {

    export namespace Dialect {

        /**
         * Contains the dialects supported by Mandarine
         */
        export enum Dialects {
            POSTGRESQL = "postgresql"
        }

        /**
         * Contains the interface for a dialect implementation.
         * This is used when a new database system will be added to Mandarine as this class defines how syntax should be written
         */
        export interface Dialect {
            getDefaultSchema(): string;
            getTableMetadata(table: Entity.Table): Entity.TableMetadata;
            getColumnTypeSyntax(column: Entity.Column): string;
            createTable(tableMetadata: Entity.TableMetadata, columns: Array<Entity.Column>, ifNotExist: boolean): string;
            getTableName(tableMetadata: Entity.TableMetadata): string;
            addPrimaryKey(tableMetadata: Entity.TableMetadata, primaryKeyCol: Entity.Column): string;
            addUniqueConstraint(tableMetadata: Entity.TableMetadata, uniqueCol: Entity.Column): string;
            addColumn(tableMetadata: Entity.TableMetadata, column: Entity.Column): string;
            selectStatement(tableMetadata: Entity.TableMetadata): string;
            selectWhereStatement(tableMetadata: Entity.TableMetadata): string;
            selectAllCountStatement(tableMetadata: Entity.TableMetadata): string;
            selectAllCountWhereStatement(tableMetadata: Entity.TableMetadata): string;
            deleteStatement(tableMetadata: Entity.TableMetadata): string;
            deleteWhereStatement(tableMetadata: Entity.TableMetadata): string;
            selectColumnSyntax(colName: string, operator: string, colValue: string, secureParameter?: boolean): string;
            insertStatement(tableMetadata: Entity.TableMetadata, entity: Entity.Table, values: object, secureParameter?: boolean): any;
            updateStatement(tableMetadata: Entity.TableMetadata, entity: Entity.Table, values: object): any;
        }
    }

    /**
     * Contains all the essentials related to an entity.
     */
    export namespace Entity {

        /**
         * Contains the metadata of a table such as its schema and its name
         */
        export interface TableMetadata {
            name?: string;
            schema: string;
        }

        export namespace Decorators {

            export interface Table extends TableMetadata {
            }

            /**
             * Contains the information the @Column decorator can and will have
             */
            export interface Column {
                name?: string;
                fieldName?: string;
                type?: Types;
                unique?: boolean;
                nullable?: boolean;
                length?: number;
                precision?: number;
                scale?: number;
                incrementStrategy?: boolean;
                options?: any;
            }

            export interface GeneratedValue {
                strategy: "SEQUENCE" | "MANUAL",
                manualHandler?: Function;
            }
        }

        /**
        * Contains the information of a column
        */
        export interface Column extends Entity.Decorators.Column {
        }

        export class EntityManager extends EntityManagerClass {}

        /**
        * Contains the information & structure of a table
        */
        export interface Table {
            tableName: string;
            schema: string;
            columns: Column[];
            uniqueConstraints: Column[];
            primaryKey: Column;
            instance: any;
            className: string;
        }
    }

    /**
     * References to a connection/connector classes.
     */
    export namespace Connection {

        /** Default connector options. */
        export interface ConnectorOptions {}

        /** Default connector client. */
        export interface ConnectorClient {}

        /** Connector interface for a database provider connection. */
        export interface Connector {
        }
    }

    /**
    * Contains the defaults for Mandarine's ORM
    */
    export namespace Defaults {
        export const ColumnDecoratorDefault: Entity.Decorators.Column = {
            name: undefined,
            unique: false,
            nullable: true,
            length: 255,
            precision: 8,
            scale: 2,
            incrementStrategy: false,
            options: {}
        };
    }
}