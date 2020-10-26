import { Row } from "./rows.ts";

export interface IQueryResult {
    statement: string,
    rows: Array<Row>,
    rowCount: number,
    success: boolean
}

export class QueryResult implements IQueryResult {

    constructor(public statement: string, public rows: Array<Row>, public rowCount: number, public success: boolean) {}

    public rowsToObjects<T = any>(): Array<T> {
        return this.rows.reduce((a: Array<T>, b: Row) => (a as any).concat([Object.fromEntries(b.map(e => [e.name, e.value]))]), []);
    }

}