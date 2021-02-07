// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../mod.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";
import { Types } from "../sql/types.ts";

export class MysqlDialect implements Mandarine.ORM.Dialect.Dialect {

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

    public getColumnTypeSyntax(column: Mandarine.ORM.Entity.Column): string | undefined {

        if(column.incrementStrategy != undefined && column.incrementStrategy == true) {
            if(column.options.generatedValue.strategy == "SEQUENCE") {
                return `SERIAL`;
            }
        }

        switch(column.type) {
            case Types.VARCHAR:
            case Types.LONGVARCHAR:
                return `varchar(${column.length})`;
            break;
            case Types.NUMERIC:
                return `numeric(${column.precision},${column.scale})`;
            break;
            case Types.FLOAT:
                return `float`;
            break;
            case Types.DOUBLE:
                return `double(${column.precision},${column.scale})`;
            break;
            case Types.DECIMAL:
                return `decimal(${column.precision || 10},${column.scale || 0})`;
            break;
            case Types.BOOLEAN:
                return `boolean`;
            break;
            case Types.TEXT:
                return `text`;
            break;
            case Types.SMALLINT:
                return `smallint`;
            break;
            case Types.CHAR:
                return `char(1)`;
            break;
            case Types.BIGINT:
                return `bigint`;
            break;
            case Types.DATE:
                return `date`;
            break;
            case Types.INTEGER:
                return `integer`;
            break;
            case undefined:
                throw new Error("Type not supported");
            break;
            default:
                throw new Error(`${Types[column.type]} not supported`);
        }
        
    }

    public createTable(tableMetadata: Mandarine.ORM.Entity.TableMetadata, columns: Array<Mandarine.ORM.Entity.Column>, ifNotExist: boolean): string {
        let syntax = `CREATE TABLE ${(ifNotExist) ? "IF NOT EXISTS" : ""} ${(tableMetadata.schema == undefined) ? "" : tableMetadata.schema}.${tableMetadata.name}`;
        
        if(columns) {
            let columnSqls: Array<string> = new Array<string>();
            const reservedKeywords = this.getReservedKeywords();

            columns.forEach((column) => {
                if(reservedKeywords.includes(column.name?.toUpperCase() || "")) throw new MandarineORMException(MandarineORMException.RESERVED_KEYWORD_COLNAME.replace("%column%", column.name || "undefined"), "PostgresSQLDialect");
                columnSqls.push(`${column.name} ${this.getColumnTypeSyntax(column)} ${(column.nullable == false) ? "NOT NULL" : ""}`);
            });
            syntax += ` (
                ${columnSqls.join(",")}
                )`;

            syntax += ";";
        }

        return syntax;
    }

    public getTableName(tableMetadata: Mandarine.ORM.Entity.TableMetadata): string {
        return `${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name}`;
    }

    public addPrimaryKey(tableMetadata: Mandarine.ORM.Entity.TableMetadata, primaryKeyCol: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${this.getTableName(tableMetadata)} ADD PRIMARY KEY(${primaryKeyCol.name});`;
    }
    
    public addUniqueConstraint(tableMetadata: Mandarine.ORM.Entity.TableMetadata, uniqueCol: Mandarine.ORM.Entity.Column): string {
        const tableName = this.getTableName(tableMetadata);
        return `ALTER TABLE ${tableName} ADD CONSTRAINT ${tableMetadata.name + "_unique"} UNIQUE (${uniqueCol.name});`;
    }

    public addColumn(tableMetadata: Mandarine.ORM.Entity.TableMetadata, column: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${this.getTableName(tableMetadata)} ADD COLUMN ${column.name} ${this.getColumnTypeSyntax(column)} ${column.nullable === false ? 'NOT NULL' : ''}; `
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
        return `"${colName}" ${operator} ${(secureParameter != undefined && secureParameter == true) ? `${colValue}` : `'${colValue}'`}`;
    }

    public insertStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata, entity: Mandarine.ORM.Entity.Table, values: object): any {
        let syntax: string = `INSERT INTO ${this.getTableName(tableMetadata)} (%columns%) VALUES (%values%)`;
        let primaryKey = entity.primaryKey;

        let insertionValues: any = {};
        entity.columns.forEach((column, index) => {
            if(primaryKey != undefined) {
                if(column.name == primaryKey.name) {
                    if(primaryKey.incrementStrategy) {
                        if(primaryKey.options.generatedValue.strategy == "MANUAL") {
                            if(primaryKey.options.generatedValue.manualHandler == undefined) {
                                throw new MandarineORMException(MandarineORMException.GENERATION_HANDLER_REQUIRED, "MysqlDialect");
                            } else {
                                insertionValues[<string>primaryKey.name] = primaryKey.options.generatedValue.manualHandler();
                                return;
                            }
                        } else if(primaryKey.options.generatedValue.strategy == "SEQUENCE") {
                            return;
                        }
                    } else {
                        insertionValues[<string>primaryKey.name] = (<any>values)[<string>primaryKey.name];
                        return;
                    }
                }
            }

            let value = (<any>values)[<string>column.name];

            if(value == undefined) {
                value = null;
            }

            insertionValues[`${column.name}`] = value;
        });

        let columnsForInsertion = Object.keys(insertionValues);
        syntax = syntax.replace('%columns%', columnsForInsertion.join(", "));

        return {
            query: syntax,
            insertionValuesObject: insertionValues
        };
    }

    public updateStatement(tableMetadata: Mandarine.ORM.Entity.TableMetadata, entity: Mandarine.ORM.Entity.Table, values: object): any {
        let syntax: string = `UPDATE ${this.getTableName(tableMetadata)} SET (%columns%) = (%values%) WHERE "${entity.primaryKey.name}" = %primaryKeyValue%`;

        let updateValues = {};
        entity.columns.forEach((column) => {
            let value = (<any>values)[`"${column.name}"`];
            if(value == undefined) value = null;

            (<any>updateValues)[`"${column.name}"`] = value;
        });

        let setters: Array<any> = new Array<any>();

        let columnsForModification = Object.keys(updateValues);
        syntax = syntax.replace('%columns%', columnsForModification.join(", "));

        return {
            query: syntax,
            updateValuesObject: updateValues
        };
    }

    public parameterizedQueryInformationType(): ["number" | "string", string] {
        return ["string", "?"]
    }

    public getColumnNameForStatements(colName: string): string {
        return colName;
    }

    public getReservedKeywords(): Array<string> {
        return ["ADD","ALL","ALTER","ANALYZE","AND","AS","ASC","AUTO_INCREMENT","BDB","BERKELEYDB","BETWEEN","BIGINT","BINARY","BLOB","BOTH","BTREE","BY","CASCADE","CASE","CHANGE","CHAR","CHARACTER","CHECK","COLLATE","COLUMN","COLUMNS","CONSTRAINT","CREATE","CROSS","CURRENT_DATE","CURRENT_TIME","CURRENT_TIMESTAMP","DATABASE","DATABASES","DAY_HOUR","DAY_MINUTE","DAY_SECOND","DEC","DECIMAL","DEFAULT","DELAYED","DELETE","DESC","DESCRIBE","DISTINCT","DISTINCTROW","DIV","DOUBLE","DROP","ELSE","ENCLOSED","ERRORS","ESCAPED","EXISTS","EXPLAIN","FALSE","FIELDS","FLOAT","FOR","FORCE","FOREIGN","FROM","FULLTEXT","FUNCTION","GEOMETRY","GRANT","GROUP","HASH","HAVING","HELP","HIGH_PRIORITY","HOUR_MINUTE","HOUR_SECOND","IF","IGNORE","IN","INDEX","INFILE","INNER","INNODB","INSERT","INT","INTEGER","INTERVAL","INTO","IS","JOIN","KEY","KEYS","KILL","LEADING","LEFT","LIKE","LIMIT","LINES","LOAD","LOCALTIME","LOCALTIMESTAMP","LOCK","LONG","LONGBLOB","LONGTEXT","LOW_PRIORITY","MASTER_SERVER_ID","MATCH","MEDIUMBLOB","MEDIUMINT","MEDIUMTEXT","MIDDLEINT","MINUTE_SECOND","MOD","MRG_MYISAM","NATURAL","NOT","NULL","NUMERIC","ON","OPTIMIZE","OPTION","OPTIONALLY","OR","ORDER","OUTER","OUTFILE","PRECISION","PRIMARY","PRIVILEGES","PROCEDURE","PURGE","READ","REAL","REFERENCES","REGEXP","RENAME","REPLACE","REQUIRE","RESTRICT","RETURNS","REVOKE","RIGHT","RLIKE","RTREE","SELECT","SET","SHOW","SMALLINT","SOME","SONAME","SPATIAL","SQL_BIG_RESULT","SQL_CALC_FOUND_ROWS","SQL_SMALL_RESULT","SSL","STARTING","STRAIGHT_JOIN","STRIPED","TABLE","TABLES","TERMINATED","THEN","TINYBLOB","TINYINT","TINYTEXT","TO","TRAILING","TRUE","TYPES","UNION","UNIQUE","UNLOCK","UNSIGNED","UPDATE","USAGE","USE","USER_RESOURCES","USING","VALUES","VARBINARY","VARCHAR","VARCHARACTER","VARYING","WARNINGS","WHEN","WHERE","WITH","WRITE","XOR","YEAR_MONTH","ZEROFILL"]
    }
}