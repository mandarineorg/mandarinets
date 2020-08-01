# Mandarine Query Langauge (MQL)
Mandarine Query Language serves as a helper to write queries. The main objective of MQL is to avoid the writing of SQL queries in your application's layer, and keep everything in a programmatic environment. This is because, **MandarineTS** aims to respect SOLID principles & follow MVC patterns as well as making your code as simple and readable as possible.

----

## The lexical processor
MQL makes use of a lexical processor that will transform the names of your repositories' methods in SQL & processable queries.

```typescript
findByAirlineAndPassengerName(airline: string, passengerName: string)
```

Will be transformed equal to

```typescript
SELECT .... WHERE airline = $1 AND passengerName = $2

# $1 = airline parameter
# $2 = passengerName parameter
```

## MQL Operators

Operators are keywords that will tell the lexical processor what type of operation is being requested at a SQL level.

Currently, MQL only supports the following operators:

- AND
- OR
- IsNotNull
- IsNull
- IsNotEmpty
- IsEmpty
- StartingWith
- EndsWith
- Like
- GreaterThan
- LessThan

-----

## Definers

Definers are keywords that will shape your final SQL query. Definers are used for the lexical processor to identify what type of query is being or will be built.

### General Definers

- `findAll`: Select all rows
- `deleteAll`: Delete all rows in entity
- `countAll`: Count all rows in entity
- `findBy...`: Creates & executes a select query
- `countBy...`: Creates & executes a select count query
- `existsBy...`: Creates & executes a verification statement
- `deleteBy...`: Creates & executes a delete query

### "Save" definer

In order to add (or update) information to your entity in your database, MQL allows you to do so by using save [(Click here to see declaration)](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/orm-core/repository/mandarineRepository.ts#MandarineRepository)

- `save` is part of a native method of a mandarine repository.
- `save` takes one argument which will be a object of your repository's model with the data to be inserted

-----

## Naming conventions

1) **Do** use camel case.
2) **Do not** use underscores, or other characters that may affect readability.
3) The names of your columns **must** match the name of your parameter in your repository method. Otherwise, query execution will fail.
