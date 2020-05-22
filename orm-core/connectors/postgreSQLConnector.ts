import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Client as PostgresClient, Pool } from "https://deno.land/x/postgres/mod.ts";
import { PoolClient } from "https://deno.land/x/postgres/client.ts";
import { QueryResult, QueryConfig } from "https://deno.land/x/postgres/query.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";

export interface PostgresConnectorInterface extends Mandarine.ORM.Connection.Connector {
    /** Client that maintains an external database connection. */
    clientPooler: Mandarine.ORM.Connection.ConnectorClient;
    
    /** Is the client connected to an external instance. */
    connected?: boolean;
    
    /** Connect to an external database instance. */
    makeConnection(): Promise<PoolClient>;
    
    /** Execute a query on the external database instance. */
    query(query: string | QueryConfig): Promise<QueryResult>;

    /** Execute a query on the external database instance with an existing connection. */
    queryWithConnection(connection: PoolClient, query: string | QueryConfig, releaseOnFinish: boolean): Promise<QueryResult>;
    
    /** Execute queries within a transaction on the database instance. */
    transaction?(queries: string[]): Promise<any[]>;
    
    /** Disconnect from the external database instance. */
    close?(): Promise<any>;
}

export class PostgresConnector implements PostgresConnectorInterface {

    public clientPooler: Pool;
  
    /** Create a PostgreSQL connection. */
    constructor(host: string, username: string, password: string, database: string, port: number, poolSize: number) {
      this.clientPooler = new Pool({
        hostname: host,
        user: username,
        password: password,
        database: database,
        port: port ?? 5432,
      }, poolSize ?? 100, true);
    }
  
    public async makeConnection(): Promise<PoolClient> {
        return await this.clientPooler.connect();
    }

    public async query(query: string | QueryConfig): Promise<QueryResult> {
        let connection = await this.makeConnection();
        let result: Promise<QueryResult> = connection.query(query);
        return result;
    }

    public async queryWithConnection(connection: PoolClient, query: string | QueryConfig): Promise<QueryResult> {
      let result: Promise<QueryResult> = connection.query(query);
      return result;
  }
}