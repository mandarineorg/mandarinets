# Mandarine Data

Mandarine Data is one of the four essential cores Mandarine has. Mandarine Data is responsible for creating the data layer in your application and interact directly with database clients.

## Concepts
- Models / Entities
    - Classes that represent a table in your database, this class has columns (properties) and it will be used for your database to interact with your code and vice-versa.
- Repositories
    - An abstract class that contains your queries as well as predefined queries such as **save**, **findAll**, **deleteAll**, **countAll**
- Repositories can contain custom queries or MQL queries.
- Repositories are Mandarine Components, but they are only used for database interaction purposes which means you they cannot receive injections as described here.

## Data Source
In order to connect your database with your Mandarine-powered application, you need to establish the connection information through [Mandarine's properties file](/docs/mandarine/properties)

**Structure:**

```typescript
{
    "mandarine": {
        "dataSource": {
            "dialect": "postgresql",
            "data": {
                "host": "",
                "port": 5432,
                "username": "",
                "password": "",
                "database": ""
            }
        }
    }
}
```

-----
 
## Dialects

[See enum here](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/orm-core/mandarine-orm.ns.ts#MandarineORM.Dialect.Dialects)

Mandarine currently supports the following dialects:
- PostgreSQL
