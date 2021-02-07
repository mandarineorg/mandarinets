// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ClientConfig, Client } from "https://deno.land/x/mysql@v2.7.0/mod.ts";
import type { ExecuteResult } from "https://deno.land/x/mysql@v2.7.0/src/connection.ts";
import { Log } from "../../logger/log.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";


export type MysqlConnectorConfigInterface = ClientConfig;

export interface MysqlConnectorInterface {
    query(sql: string, params?: Array<any>): Promise<any>;
    execute(sql: string, params?: Array<any>): Promise<ExecuteResult>;
}

export class MysqlConnector implements MysqlConnectorInterface {

    private clientPooler!: Client;
    public logger: Log = Log.getLogger(MysqlConnector);
    public currentDatabase!: string;

    constructor(private config: MysqlConnectorConfigInterface) {
        this.currentDatabase = config.db!;
        delete config.db;
    }

    private async initializer(config: MysqlConnectorConfigInterface) {
        config.poolSize = config.poolSize || 100;
        try {
            this.clientPooler = await new Client().connect(config);
        } catch(error) {
            this.logger.compiler("Aborting database client", "error", error);
            throw new MandarineORMException(MandarineORMException.IMPOSSIBLE_CONNECTION, "MysqlConnector");
        }
    }

    private async validateClientPooler() {
        if(this.clientPooler === undefined) {
            await this.initializer(this.config);
        }
    }

    public async query(sql: string, params?: Array<any>): Promise<any> {
        await this.validateClientPooler();

        return (await this.clientPooler.query(sql, params || []));
    }

    public async execute(sql: string, params?: Array<any>): Promise<any> {
        await this.validateClientPooler();

        return (await this.clientPooler.execute(sql, params || []));
    }
    
}