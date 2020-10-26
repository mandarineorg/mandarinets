// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommandTypes } from "./commandTypes.ts";
import { DispatchAsync, encoder, QueryMapper } from "./lib.ts";
import { PgManager } from "./pgManager.ts";
import { IQueryResult, QueryResult } from "./queryResult.ts";
import { AsyncResult } from "./utils.ts";

const defaultQueryMapper = (result: AsyncResult<IQueryResult>): any => {
    return new QueryResult(result, result.data?.statement, result.data?.rows, result.data?.rowCount, result.data?.success);
}

export class PgClient {

    public opId: number = -1;
    public rid: number = -1;

    constructor(manager: PgManager) {
        if(manager) {
            PgManager.throwIfUnset();
            this.opId = PgManager.opId;
            this.rid = PgManager.rid;
        }
    }

    private executeMapper<T>(result: any, mapper: QueryMapper | undefined): T {
        if(mapper) {
            return mapper(result);
        } else {
            return defaultQueryMapper(result);
        }
    }

    public async query<T = QueryResult>(statement: string, params?: Array<any>, mapper?: QueryMapper): Promise<T> {
        const result = await DispatchAsync<IQueryResult>(CommandTypes.Query, encoder.encode(JSON.stringify({
            statement: statement,
            parameters: params || []
        })));

        return this.executeMapper<T>(result, mapper);
    }

    public async execute<T = QueryResult>(statement: string, params?: Array<any>, mapper?: QueryMapper): Promise<T> {
        const result = await DispatchAsync<IQueryResult>(CommandTypes.Execute, encoder.encode(JSON.stringify({
            statement: statement,
            parameters: params || []
        })));

        return this.executeMapper<T>(result, mapper);
    }

    public async batch_execute<T = QueryResult>(statement: string | Array<string>, mapper?: QueryMapper): Promise<T> {
        let finalStatement: String;
        if(Array.isArray(statement)) {
            finalStatement = statement.join("; ");
        } else {
            finalStatement = statement;
        }

        const result = await DispatchAsync<IQueryResult>(CommandTypes.BatchExecute, encoder.encode(JSON.stringify({
            statement: finalStatement
        })));

        return this.executeMapper<T>(result, mapper);
    }

}