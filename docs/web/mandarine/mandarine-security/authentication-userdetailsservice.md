# User Details Service

---------

## Overview

The User Details Service is a Mandarine-powered component (_preferably annotated with `@Service`_) which has a single responsability. This single responsability is to fetch a specific user from a collection of `Mandarine.Types.UserDetails`.  

An User Details Service must implement `Mandarine.Types.UserDetailsService` otherwise it will result in failure at MCT (Mandarine Compile Time).

## `Mandarine.Types.UserDetailsService` interface

- loadUserByUsername: **Method**
    - Method Signature: `(username: string) => UserDetails`
    - Fetches an user based on an username from a collection that implements `Mandarine.Types.UserDetails`.
    - Returns undefined if user is not found

&nbsp;

## Basic Usage

```typescript
import { Service, Mandarine } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

@Service()
export class UserDetailsServiceImplementation implements Mandarine.Security.Auth.UserDetailsService {
    public users: Array<Mandarine.Types.UserDetails> = new Array<Mandarine.Types.UserDetails>();

    public loadUserByUsername(username: string) {
        return this.users.find((item: Mandarine.Types.UserDetails) => item.username === username);
    }
}
```