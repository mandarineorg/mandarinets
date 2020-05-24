import { Mandarine } from "../../mod.ts";
import { Types } from "../sql/types.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";

export class PostgreSQLDialect implements Mandarine.ORM.Dialect.Dialect {

    public getDefaultSchema(): string {
        return "public";
    }

    public getTableMetadata(table: Mandarine.ORM.Entity.Table): Mandarine.ORM.Entity.TableMetadata {
        let tableMetadata: Mandarine.ORM.Entity.TableMetadata = {
            name: table.tableName,
            schema: table.schema
        };

        if(tableMetadata.name == (null || undefined)) tableMetadata.name = table.className;
        if(tableMetadata.schema == (null || undefined)) tableMetadata.schema = this.getDefaultSchema();
        return tableMetadata;
    }

    public getColumnTypeSyntax(column: Mandarine.ORM.Entity.Column): string {

        if(column.incrementStrategy != undefined && column.incrementStrategy == true) {
            if(column.options.generatedValue.strategy == "SEQUENCE") {
                return `SERIAL`;
            }
        }

        switch(column.type) {
            case Types.VARCHAR:
            case Types.LONGVARCHAR:
                return `character varying(${column.length})`;
            break;
            case Types.NUMERIC:
                return `numeric(${column.precision},${column.scale})`;
            break;
            case Types.FLOAT:
                return `float4`;
            break;
            case Types.DOUBLE:
                return `double8`;
            break;
            case Types.DECIMAL:
                return `numeric`;
            break;
            case Types.BOOLEAN:
                return `boolean`;
            break;
            case Types.TEXT:
                return `text`;
            break;
            case Types.SMALLINT:
                return `int2`;
            break;
            case Types.CHAR:
                return `char(1)`;
            break;
            case Types.BIGINT:
                return `int8`;
            break;
            case Types.BIGSERIAL:
                return `bigserial`;
            break;
            case Types.DATE:
                return `date`;
            break;
            case Types.INTEGER:
                return `integer`;
            break;
            case Types.JSON:
                return `json`;
            break;
            case Types.JSONB:
                return `jsonb`;
            break;
            case Types.UUID:
                return `uuid`;
            break;
            case Types.TIME:
                return `time${(column.precision == undefined) ? "" : `(${column.precision})` } without time zone`;
            break;
            case Types.TIME_WITH_TIMEZONE:
                return `time${(column.precision == undefined) ? "" : `(${column.precision})` } with time zone`;
            break;
            case Types.TIMESTAMP:
                return `timestamp${(column.precision == undefined) ? "" : `(${column.precision})` } without time zone`;
            break;
            case Types.TIMESTAMP_WITH_TIMEZONE:
                return `timestamp${(column.precision == undefined) ? "" : `(${column.precision})` } with time zone`;
            break;
        }
    }

    public createTable(tableMetadata: Mandarine.ORM.Entity.TableMetadata, columns: Array<Mandarine.ORM.Entity.Column>, ifNotExist: boolean): string {
        let syntax = `CREATE TABLE ${(ifNotExist) ? "IF NOT EXISTS" : ""} ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}."${tableMetadata.name}"`;
        
        if(columns != (undefined || null)) {
            let columnSqls: Array<string> = new Array<string>();

            columns.forEach((column) => {
                columnSqls.push(`${column.name} ${this.getColumnTypeSyntax(column)} ${(column.nullable == false) ? "NOT NULL" : ""}`);
            });
            syntax += ` (
                ${columnSqls.join(",")}
                )`;

            syntax += ";";

            return syntax;
        } else {
            return syntax + "();";
        }
    }

    public getTableName(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name}`;
    }

    public addPrimaryKey(tableMetadata: Mandarine.ORM.Entity.TableMetadata, primaryKeyCol: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${this.getTableName(tableMetadata)} ADD PRIMARY KEY(${primaryKeyCol.name});`;
    }

    public addUniqueConstraint(tableMetadata: Mandarine.ORM.Entity.TableMetadata, uniqueCol: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${this.getTableName(tableMetadata)} ADD UNIQUE (${uniqueCol.name});`;
    }

    public addColumn(tableMetadata: Mandarine.ORM.Entity.TableMetadata, column: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${this.getTableName(tableMetadata)} ADD COLUMN IF NOT EXISTS ${column.name} ${this.getColumnTypeSyntax(column)};`
    }

    public selectStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `SELECT * FROM ${this.getTableName(tableMetadata)}`
    }

    public selectWhereStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `${this.selectStatement(tableMetadata)} WHERE`;
    }

    public selectAllCountStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `SELECT COUNT(*) FROM ${this.getTableName(tableMetadata)}`;
    }

    public selectAllCountWhereStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `${this.selectAllCountStatement(tableMetadata)} WHERE`;
    }

    public deleteStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `DELETE FROM ${this.getTableName(tableMetadata)}`;
    }

    public deleteWhereStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `${this.deleteStatement(tableMetadata)} WHERE`;
    }

    public selectColumnSyntax(colName: string, operator: string, colValue: string, secureParameter?: boolean): string {
        return `${colName} ${operator} ${(secureParameter != undefined && secureParameter == true) ? `${colValue}` : `'${colValue}'`}`;
    }

    public insertStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata, entity: Mandarine.ORM.Entity.Table, values: object): any {
        let syntax: string = `INSERT INTO ${this.getTableName(tableMetadata)} (%columns%) VALUES (%values%)`;
        let primaryKey = entity.primaryKey;

        let insertionValues: object = {};
        entity.columns.forEach((column, index) => {
            if(primaryKey != undefined) {
                if(column.name == primaryKey.name) {
                    if(primaryKey.incrementStrategy) {
                        if(primaryKey.options.generatedValue.strategy == "MANUAL") {
                            if(primaryKey.options.generatedValue.manualHandler == undefined) {
                                throw new MandarineORMException(MandarineORMException.GENERATION_HANDLER_REQUIRED, "PostgreSQLDialect");
                            } else {
                                insertionValues[primaryKey.name] = primaryKey.options.generatedValue.manualHandler();
                                return;
                            }
                        } else if(primaryKey.options.generatedValue.strategy == "SEQUENCE") {
                            return;
                        }
                    } else {
                        insertionValues[primaryKey.name] = values[primaryKey.name];
                        return;
                    }
                }
            }

            let value = values[column.name];

            if(value == undefined) {
                value = null;
            }

            insertionValues[column.name] = value;
        });

        let columnsForInsertion = Object.keys(insertionValues);
        syntax = syntax.replace('%columns%', columnsForInsertion.join(", "));

        return {
            query: syntax,
            insertionValuesObject: insertionValues
        };
    }

}