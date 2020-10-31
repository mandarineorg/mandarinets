# PG Client
The `PgClient` object allows you to execute different type of queries in Postgres.

---------

## Usage
The `PgClient` object takes the [`PgManager` object](/docs/v2.2.1/pg-driver/pgmanager) (previously created in the code) in the constructor. You could optionally do `PgManager.getClient()` to get a client from the instance of `PgManager`.

```typescript
import { PgManager, PgClient, Configuration } from "https://deno.land/x/mandarine_postgres@v2.2.1/ts-src/mod.ts";

const configuration: Configuration = { ... };

const manager: PgManager = new PgManager(configuration);
const client: PgClient = manager.getClient();
```
**OR**
```typescript
const client: PgClient = new PgClient(manager);
```

## Methods

**`query`**  

    - Signature: `query<T = QueryResult>(statement: string, params?: Array<any>, mapper?: QueryMapper): Promise<T>`
        - statement: SQL statement to execute.
        - params: Array of parameters to pass if statement is parametarized
        - mapper: Query result processor.
    - Returns: An instance of `QueryResult` if not mapper is set

```typescript
import { PgManager, QueryResult } from "https://deno.land/x/mandarine_postgres@v2.2.1/ts-src/mod.ts";

const pgManager: PgManager = new PgManager({...});
const users: QueryResult = await pgManager.getClient().query("SELECT * FROM users");
console.log(users);
/**
 * statement: "SELECT * FROM users",
 * rows: [
 *  [
 *     { name: "id", value: 1, type: "int4" },
 *     { name: "username", value: "mandarine", type: "varchar" }
 *   ]
 * ],
 * rowCount: 1,
 * success: true,
 * error: undefined
 */
```

**`execute`**  

    - Signature: `execute<T = QueryResult>(statement: string, params?: Array<any>, mapper?: QueryMapper): Promise<T>`
        - statement: SQL statement to execute.
        - params: Array of parameters to pass if statement is parametarized
        - mapper: Query result processor.
    - Returns: An instance of `QueryResult` if not mapper is set

```typescript
import { PgManager, QueryResult } from "https://deno.land/x/mandarine_postgres@v2.2.1/ts-src/mod.ts";

const pgManager: PgManager = new PgManager({...});
const insertUsers: QueryResult = await pgManager.getClient().execute("INSERT INTO users VALUES ($1, $2)", [1, 'mandarine']);
console.log(insertUsers);
/**
 * statement: "INSERT INTO users VALUES ($1, $2)",
 * rows: [],
 * rowCount: 1,
 * success: true,
 * error: undefined
 */
```

**`batchExecute`**  

    - Signature: `batchExecute<T = QueryResult>(statement: string | Array<string>, mapper?: QueryMapper): Promise<T> `
        - statement: An string representing the SQL statement to execute or an string array representing multiple queries to be executed.
        - mapper: Query result processor.
    - Returns: An instance of `QueryResult` if not mapper is set

```typescript
import { PgManager, QueryResult } from "https://deno.land/x/mandarine_postgres@v2.2.1/ts-src/mod.ts";

const pgManager: PgManager = new PgManager({...});
const createUsersTable: QueryResult = await pgManager.getClient().batchExecute([
        `CREATE SEQUENCE public.users_id_seq
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 2147483647
        CACHE 1;`,
        
        `ALTER SEQUENCE public.users_id_seq
        OWNER TO postgres;`,
        
        `
        CREATE TABLE public.users
            (
                id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
                username character varying(255) COLLATE pg_catalog."default",
            )`]);
console.log(createUsersTable);
/**
 * statement: "CREATE SEQUENCE............",
 * rows: [],
 * rowCount: 0,
 * success: true,
 * error: undefined
 */
```