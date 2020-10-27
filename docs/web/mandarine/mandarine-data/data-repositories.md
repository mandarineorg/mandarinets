# Repositories
Mandarine's built-in ORM offers the concept & usability of Repositories. Repositories serve as a bridge between your database & your code, they execute tasks such as bringing information from the database to your code, deleting & saving, and more. In a nutshell, repositories allow you to execute queries programmatically, this means, you do not have to necessarily write the SQL query.

----

## Declaring a repository
Repositories are declared by using the decorator `@Repository()` . The `@Repository` decorator targets an **abstract class**.

The abstract class that will represent your repository must be extended [MandarineRepository](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/orm-core/repository/mandarineRepository.ts#MandarineRepository) . MandarineRepository is a generic class that will take `T` as your model's instance.

**Syntax:**
```typescript
@Repository()
```

Example
```typescript
import { Repository, MandarineRepository } from "https://deno.land/x/mandarinets@v2.1.5/mod.ts";

@Repository()
abstract class MyRepository extends MandarineRepository<MyModel> {

    constructor() {
        super(MyModel);
    }
    
}
```

> **Note** that all repositories must have a constructor with a super call. This super call will take your model's instance as shown above.

```typescript
constructor() {
     super(MyModel);
} 
```
