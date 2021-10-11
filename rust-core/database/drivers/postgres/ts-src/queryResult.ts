// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Row } from "./rows.ts";
import type { AsyncResult } from "./utils.ts";

export interface IQueryResult {
    statement: string | undefined,
    rows: Array<Row>,
    rowCount: number,
    success: boolean
    error: string | undefined;
}

export class QueryResult implements IQueryResult {

    public error: string | undefined = undefined;

    constructor(result: AsyncResult<IQueryResult>, public statement: string | undefined, public rows: Array<Row>, public rowCount: number, public success: boolean) {
        if(result.data == undefined) {
            this.statement = undefined;
            this.rows = [];
            this.rowCount = 0;
            this.success = false;
            this.error = result.error;
        }
    }

    public rowsToObjects<T = any>(): Array<T> {
        return (this.rows || []).reduce((a: Array<T>, b: Row) => (a as any).concat([Object.fromEntries(b.map(e => [e.name, e.value]))]), []);
    }

}