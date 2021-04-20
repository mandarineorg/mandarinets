// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { PoolClient } from "https://deno.land/x/postgres@v0.5.0/client.ts";
import { Pool } from "https://deno.land/x/postgres@v0.5.0/mod.ts";
import type { QueryConfig, QueryResult } from "https://deno.land/x/postgres@v0.5.0/query.ts";
import { Log } from "../../logger/log.ts";
import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MandarineORMException } from "../core/exceptions/mandarineORMException.ts";

export interface PostgresConnectorInterface extends Mandarine.ORM.Connection.Connector {
    /** Client that maintains an external database connection. */
    clientPooler: Mandarine.ORM.Connection.ConnectorClient;
    
    /** Is the client connected to an external instance. */
    connected?: boolean;
    
    /** Connect to an external database instance. */
    makeConnection(): Promise<PoolClient | undefined>;
    
    /** Execute a query on the external database instance. */
    query(query: string | QueryConfig): Promise<QueryResult | undefined>;

    /** Execute a query on the external database instance with an existing connection. */
    queryWithConnection(connection: PoolClient, query: string | QueryConfig, releaseOnFinish: boolean): Promise<QueryResult | undefined>;
    
    /** Execute queries within a transaction on the database instance. */
    transaction?(queries: string[]): Promise<any[]>;
    
    /** Disconnect from the external database instance. */
    close?(): Promise<any>;
}

/**
* Connector for PostgreSQL
*/
export class PostgresConnector implements PostgresConnectorInterface {

    public clientPooler: Pool;
    public logger: Log = Log.getLogger(PostgresConnector);
  
    /** Create a PostgreSQL connection. */
    constructor(host: string, username: string, password: string, database: string, port: number, poolSize: number) {
      try {
        this.clientPooler = new Pool({
          hostname: host,
          user: username,
          password: password,
          database: database,
          port: port ?? 5432,
        }, poolSize ?? 100, true);
      } catch(error) {
        this.logger.compiler("Aborting database client", "error", error);
        throw new MandarineORMException(MandarineORMException.IMPOSSIBLE_CONNECTION, "PostgresConnector");
      }
    }
  
    public async makeConnection(): Promise<PoolClient | undefined> {
      try {
        return await this.clientPooler.connect();
      }catch(error) {
        this.logger.compiler("Database connection could not be reached", "error", error);
        this.logger.debug((<Error>error).message);
        this.logger.debug((<Error>error).stack!);
      }
    }

    public async query(query: string | QueryConfig): Promise<QueryResult | undefined> {
      try {
        const connection = await this.makeConnection();
        if(!connection) throw new Error(`Connection could not be made under query ${query}`);
        const result: QueryResult = await connection.query(query);
        await connection.release();
        return Object.assign({}, result);
      }catch(error) {
        this.logger.compiler("Query statement could not be executed", "error", error);
      }
    }

    public async queryWithConnection(connection: PoolClient, query: string | QueryConfig): Promise<QueryResult | undefined> {
      try {
        let result: Promise<QueryResult> = connection.query(query);
        return result;
      }catch(error) {
        this.logger.compiler("Query & connection have failed to be reached", "error", error);
      }
  }
}
