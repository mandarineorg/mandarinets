# Interacting With Data

Mandarine repositories work directly with [MQL](/docs/mandarine/mandarine-query-language), since MQL serves as the primary query statement writer.

------

# `@CustomQuery` Decorator

The `@CustomQuery` decorator allows you to write SQL queries in your repositories. While it is true that MQL & Mandarine's ORM aim to remove as much SQL & database code from your application's layer, it is also true that some use cases may require the use of complex SQL queries.

**Syntax:**
```typescript
@CustomQuery(query: string, secure?: boolean)
``` 
- `query`: Query to execute
- `secure`: Whether the query has secured parameters such as $1, $2, ...
    - Default: True


## API

```typescript
import { Repository, MandarineRepository, CustomQuery, Controller, GET } from "https://deno.land/x/mandarinets@v2.2.0/mod.ts";
import { Users } from "./usersModel.ts"; // A model

@Repository()
abstract class UsersRepository extends MandarineRepository<Users> {

    constructor() {
        super(Users);
    }
    
    public findByCountry(country: string) {}
    public findByFirstnameAndCountry(firstname: string, country: string) {}
    public countByCountry(country: string) {}
    public existsByLastname(lastname: string) {}

    @CustomQuery("SELECT * FROM public.users WHERE country = $1 AND firstname = 'Andres'")
    public myCustomQuery(country: string) {}
}

@Controller()
export class MyController {

    constructor(private readonly repository: UsersRepository) {}

    @GET('/custom-query')
     public async customQueryHandler() {
        return await this.repository.myCustomQuery("United States");
    }
}
```

> **Note** that every time you request a method from your repository, you **must** await it.
