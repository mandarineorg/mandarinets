# Updating Data
Updating data through the use of Mandarine-powered repositories is not hard. All it requires is to know how to save a record in your entity. [Click here for more information](http://localhost:4200/docs/mandarine/mandarine-query-language) about the `save` definer.

----

## Updating

In order to update existent data in your tables by using Mandarine-powered repositories, you will be using the same method that is used to save new information: The `save` method.

`save` takes one argument which will be your model, but unlike when saving new data, this time your model's primary key cannot be null/undefined. When your model's primary key has a value, Mandarine automatically detects that the model is not meant for saving information but for updating.

## API

```typescript
import { Component } from "https://deno.land/x/mandarinets@v2.2.0/mod.ts";
import { Users } from "./usersModel.ts";
import { UsersRepository } from "./usersRepository.ts";

@Component()
export class MyComponent() {

    constructor(private readonly usersRepo: UsersRepository) {
    }

    public async updateBillsCountry() {
        // [0] to select the first record found
        let billUser: Users = await this.usersRepo.findByFirstname("Bill")[0];
        // { id: 1, firstname: "Bill", lastname: "Clark", country: "Canada" }
        
        billUser.country = "Croatia";
        
        // Updating bill's country.
        await this.usersRepo.save(billUser);
    }
}

```
