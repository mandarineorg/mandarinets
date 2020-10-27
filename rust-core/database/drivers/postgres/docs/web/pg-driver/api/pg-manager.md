# PG Manager
The `PgManager` object allows you to create a connection and initialize the connection pool your application will be using under `Mandarine postgres`.

-------

## Configuration
The `PgManager` object takes a configuration object which will be used to connect & create the connection pool.

```typescript
interface Configuration {
    host: string,
    username: string,
    password: string,
    dbname: string,
    port?: number, // default = 5432
    poolSize?: number, // Max pool size, default = 25
    sslmode?: "Disable" | "Prefer" | "Require",
    connectTimeout?: number, // Seconds
    keepalives?: boolean,
    keepalivesIdle?: number // Seconds
}
```

## API

```typescript
import { PgManager, Configuration } from "https://deno.land/x/mandarine_postgres@v2.1.5/ts-src/mod.ts";

const configuration: Configuration = {
  host: "127.0.0.1",
  username: "postgres",
  password: "Changeme1",
  dbname: "mandarine",
  port: 5432
};

const manager: PgManager = new PgManager(configuration);
```
