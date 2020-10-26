// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommandTypes } from "./commandTypes.ts";
import { DenoCore } from "./common.ts";
import { encoder, DispatchSync, initAsyncHandler } from "./lib.ts";
import { PgClient } from "./pgClient.ts";
import { opCommandBuilder } from "./utils.ts";

export interface Configuration {
    host: string,
    username: string,
    password: string,
    dbname: string,
    port?: number,
    poolSize?: number,
    sslmode?: boolean,
    connect_timeout?: number,
    keepalives?: number,
    keepalives_idle?: number
}

export class PgManager {
    private pendingCommands: Map<String, { resolve: (data: unknown) => void; reject: (reason: any) => void }> = new Map();

    public static opId: number = -1;
    public static rid: number;
 
    constructor(config: Configuration) {
        this.preparePlugin();

        let connection = DispatchSync<any>(CommandTypes.Connect, encoder.encode(JSON.stringify({
            host: config.host,
            username: config.username,
            password: config.password,
            dbname: config.dbname,
            port: config.port ?? 5432
        })));

        if(connection.error || !connection.data.success) throw new Error(connection.error);
    }

    private preparePlugin() {
        if(PgManager.rid) throw new Error("Plugin has already been opened");
        const rid = Deno.openPlugin("./rust-core/database/drivers/postgres/target/release/libpostgres.dylib");
        PgManager.rid = rid;
        
        const { mandarine_postgres_plugin } = DenoCore.ops();
        
        if(PgManager.opId != -1) throw new Error("Plugin has already been prepared");
        PgManager.opId = mandarine_postgres_plugin;
        initAsyncHandler();
    }

    public getClient(): PgClient {
        return new PgClient(this);
    }

    public static throwIfUnset() {
        if(PgManager.opId <= 0 || !PgManager.rid) {
            throw new Error("PG Manager cannot be used because it is not fully initialized");
        }
    }



}