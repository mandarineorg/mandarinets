import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Client as PostgresClient, Pool } from "https://deno.land/x/postgres/mod.ts";
import { PoolClient } from "https://deno.land/x/postgres/client.ts";
import { QueryResult, QueryConfig } from "https://deno.land/x/postgres/query.ts";
import { Value } from "../../main-core/decorators/configuration-readers/value.ts";

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

    @Value('mandarine.dataSource.data.host')
    private host: string;

    @Value('mandarine.dataSource.data.port')
    private port: number;

    @Value('mandarine.dataSource.data.username')
    private username: string;

    @Value('mandarine.dataSource.data.password')
    private password: string;

    @Value('mandarine.dataSource.data.database')
    private database: string;

    @Value('mandarine.dataSource.data.poolSize')
    private poolSize: number;
    
    public clientPooler: Pool;
  
    /** Create a PostgreSQL connection. */
    constructor() {
      this.clientPooler = new Pool({
        hostname: this.host,
        user: this.username,
        password: this.password,
        database: this.database,
        port: this.port ?? 5432,
      }, this.poolSize ?? 100, true);
    }
  
    public makeConnection(): Promise<PoolClient> {
        return this.clientPooler.connect();
    }

    public async query(query: string | QueryConfig): Promise<QueryResult> {
        let connection = await (await this.makeConnection());
        let result: QueryResult = await connection.query(query);
        connection.release();
        return result;
    }

    public async queryWithConnection(connection: PoolClient, query: string | QueryConfig, releaseOnFinish: boolean): Promise<QueryResult> {
      let result: QueryResult = await connection.query(query);
      if(releaseOnFinish) connection.release();
      return result;
  }
}