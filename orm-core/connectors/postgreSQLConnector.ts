import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Client as PostgresClient, Pool } from "https://deno.land/x/postgres/mod.ts";
import { PoolClient } from "https://deno.land/x/postgres/client.ts";
import { QueryResult, QueryConfig } from "https://deno.land/x/postgres/query.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { Log } from "../../logger/log.ts";

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
    public logger: Log = Log.getLogger(PostgresConnector);
  
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
      try {
        return await this.clientPooler.connect();
      }catch(error) {
        this.logger.error("Database connection could not be reached");
      }
    }

    public async query(query: string | QueryConfig): Promise<QueryResult> {
      try {
        let connection = await this.makeConnection();
        let result: Promise<QueryResult> = connection.query(query);
        return result;
      }catch(error) {
        this.logger.error("Query statement could not be executed");
      }
    }

    public async queryWithConnection(connection: PoolClient, query: string | QueryConfig): Promise<QueryResult> {
      try {
        let result: Promise<QueryResult> = connection.query(query);
        return result;
      }catch(error) {
        this.logger.error("Query & connection have failed to be reached");
      }
  }
}