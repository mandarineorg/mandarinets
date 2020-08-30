# Repository
Repositories are responsible for creating a bridge between your application's layer and your database. They can handle saving, updating, deleting and retrieving data from the database with complex consults thanks to MQL (Mandarine Query Language). **Note** that Mandarine's repositories are highly dependent on MQL.

-----
&nbsp;

## Concepts
- Repositories are part of Mandarine's Data Core.
- It does not accept the use of dependency injection, but **it is** injectable

&nbsp;

## Syntax

```typescript
@Repository()
```

## Usage

```typescript
import { Repository, MandarineRepository } from "https://deno.land/x/mandarinets@v2.0.0/mod.ts";

@Repository()
abstract class MyRepository extends MandarineRepository<YourModel> {

    constructor() {
        super(YourModel);
    }
    
}
```
> Where `YourModel` is the instance that represents a database table, also known as Mandarine's ORM entity.
