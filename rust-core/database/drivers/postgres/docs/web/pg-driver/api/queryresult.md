# Query Result
The `QueryResult` object contains the information of an statement previously executed through `PgClient`. 

------

## Interface
```typescript
interface IQueryResult {
    statement: string | undefined,
    rows: Array<Row>,
    rowCount: number,
    success: boolean
    error: string | undefined;
}
```

## Row Interface
```typescript
interface Column {
    name: string,
    value: any,
    type: string
}

export type Row = Array<Column>;
```

----------------

## `PgClient` & `QueryResult`
The different methods found in `PgClient` lead to different behaviors in `QueryResult`.  

- `query`
    - `rows` are filled with the rows found from the query.
    - `rowCount` is filled with the number of rows returned.
- `execute`
    - `rows` is an empty array
    - `rowCount` is filled with the number of **affected** rows.
- `batchExecute`
    - `rows` is an empty array
    - `rowCount` is 0
    - `success` define whether the batch execution was actually successful.

---------------

## Mapping rows to an array of objects.
Optionally, the class `QueryResult` offers a helper method to map the rows from `Array<Column>` to an array of objects where the _key_ is the name of the column and the _value_ is the value of that column for that specific row.

**`rowsToObjects`**  

    - Signature: `rowsToObjects<T = any>(): Array<T>`

```typescript
import { PgManager, QueryResult } from "https://deno.land/x/mandarine_postgres@v2.2.1/ts-src/mod.ts";

const queryResult: QueryResult = ....; 
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

interface User {
    id: number;
    username: string;
}
const toObjects: Array<User> = queryResult.rowsToObjects<User>();
console.log(toObjects);
/**
 * [
    * {
    *  id: 1,
    *  username: "mandarine"
    * }
 * ]
 */
```
