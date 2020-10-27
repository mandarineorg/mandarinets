# Introduction

_Mandarine Postgres_ is a database driver for postgres that runs on [Deno](https://deno.land). The driver is written in [Rust](https://www.rust-lang.org/) & [Typescript](https://www.typescriptlang.org/) which allows it to have a more stable environment while Deno gets more mature in terms of databases.

----------
&nbsp;

## Documentation
> Deno >= 1.4.6 & Mandarine Postgres >= 2.1.4 is required for this documentation. Lower versions may result in failure.  

## Stability
We believe Deno is a very stable product for production environments, although, Deno still needs to get mature in some areas like database drivers. For that reason, we believe the bridge between Rust & Deno can bring those missing pieces most applications would need for production. By using a rust-written driver, we make use of libraries that have been out there for several years in the Rust community.

## Under The Hood  
Under the hood, Mandarine Postgres is making use of [`rust-postgres`](https://github.com/sfackler/rust-postgres) & [`tokio-postgres`](https://docs.rs/tokio-postgres/0.6.0/tokio_postgres/)