// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineConstants } from "../../../../../main-core/mandarineConstants.ts";
import { fetchPlugin, getPluginPathInternal } from "../../../../plugins/pluginPrepare.ts";
import { CommandTypes } from "./commandTypes.ts";
import { DenoCore } from "./common.ts";
import { encoder, DispatchSync, initAsyncHandler } from "./lib.ts";
import { PgClient } from "./pgClient.ts";

let _pluginPath: string | undefined;

if(!Deno.env.get('MANDARINE_INTERNAL')) {
    _pluginPath = await fetchPlugin(`https://github.com/mandarineorg/mandarinets/releases/download/${Deno.env.get('MANDARINE_VERSION') || MandarineConstants.RELEASE_VERSION}`, 'libmandarine_postgres');
} else {
    _pluginPath = getPluginPathInternal('./rust-core/database/drivers/postgres', 'libmandarine_postgres');
}

const pluginPath = _pluginPath;

export interface Configuration {
    host: string,
    username: string,
    password: string,
    dbname: string,
    port?: number,
    poolSize?: number,
    sslmode?: boolean,
    connectTimeout?: number,
    keepalives?: boolean,
    keepalivesIdle?: number
}

export class PgManager {
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
        if(!PgManager.rid || PgManager.opId == -1) {
            PgManager.rid = Deno.openPlugin(pluginPath);
            const { mandarine_postgres_plugin } = DenoCore.ops();
            if(PgManager.opId != -1) throw new Error("Plugin has already been prepared");
            PgManager.opId = mandarine_postgres_plugin;
            initAsyncHandler();
        }
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