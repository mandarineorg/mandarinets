import { Types } from "./sql/types.ts";
import { EntityManagerClass } from "./core/entityManager.ts";

export namespace MandarineORM {

    export namespace Dialect {
        export enum Dialects {
            POSTGRESQL = "postgresql"
        }

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
        }
    }

    export namespace Entity {
        export interface TableMetadata {
            name?: string;
            schema: string;
        }

        export namespace Decorators {

            export interface Table extends TableMetadata {
            }

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

        export interface Column extends Entity.Decorators.Column {
        }

        export class EntityManager extends EntityManagerClass {}

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

    export namespace Connection {

        /** Default connector options. */
        export interface ConnectorOptions {}

        /** Default connector client. */
        export interface ConnectorClient {}

        /** Connector interface for a database provider connection. */
        export interface Connector {
        }
    }

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