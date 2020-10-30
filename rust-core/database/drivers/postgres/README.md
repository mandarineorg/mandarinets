# Mandarine Postgres
[![MandarineTS CI](https://github.com/mandarineorg/mandarinets/workflows/PG%20Driver%20Ubuntu/badge.svg)](https://github.com/mandarineorg/mandarinets)

<img src="https://www.mandarinets.org/assets/images/full-logo-simple.svg" width="180" height="180" />

Mandarine Postgres. A rust-based stable postgres driver for [Deno](https://deno.land)

## Description
Mandarine Postgres is the main postgres driver for [Mandarine Framework](https://deno.land/x/mandarinets). Although, this driver is not dependent on Mandarine whatsoever which makes it usable for any use case in Deno.

Under the hood, this driver makes use of [`tokio-postgres`](https://github.com/sfackler/rust-postgres) (A rust crate for asynchronous postgres operations).

This driver is officially maintained by the core team of _Mandarine framework_.

## Documentation
To see all the available documentation of Mandarine Postgres, please [Click here](https://www.mandarinets.org/docs/master/pg-driver/introduction).

## Basic Usage
```typescript
import { PgManager, PgClient, Configuration, QueryResult } from "https://deno.land/x/mandarine_postgres@v2.2.0/ts-src/mod.ts";

const configuration: Configuration = {
  host: "127.0.0.1",
  username: "postgres",
  password: "Changeme1",
  dbname: "mandarine",
  port: 5432
};

const manager: PgManager = new PgManager(configuration);
const client: PgClient = manager.getClient();
const query: QueryResult = await client.query("SELECT * FROM users where id = $1", [1]);

```

## Questions
For questions & community support, please visit our [Discord Channel](https://discord.gg/qs72byB) or join us on our [twitter](https://twitter.com/mandarinets).

## Mandarine Postgres Main Features
Connection Pooler under the hood, Queries, Execution Queries, Batch Queries, Parameterized Statements.

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/mandarinets/issues) to provide information about a bug, feature, or improvement you would like.

## Follow us wherever we are going
- Author : [Andres Pirela](https://twitter.com/andreestech)
- Website : https://www.mandarinets.org/
- Twitter : [@mandarinets](https://twitter.com/mandarinets)
- Discord : [Click here](https://discord.gg/qs72byB)