# User Details Service

---------

## Overview

The User Details Service is a Mandarine-powered component (_preferably annotated with `@Service`_) which has a single responsability. This single responsability is to fetch a specific user from a collection of `Mandarine.Types.UserDetails`.  

An User Details Service must implement `Mandarine.Types.UserDetailsService` otherwise it will result in failure at MCT (Mandarine Compile Time).

## `Mandarine.Types.UserDetailsService` interface
```typescript
export interface UserDetailsService {
    /**
    * Locates the user based on the username.
    * 
    * @param username the username identifying the user whose data is required.
    * 
    * @returns A user record with an implementation of UserDetails
    * 
    * @throws MandarineSecurityException if no user was found.
    */
    loadUserByUsername: (username: string) => Mandarine.Types.UserDetails;
}
```

- loadUserByUsername
    - Fetches an user based on an username from a collection that implements `Mandarine.Types.UserDetails`.

&nbsp;

## Basic Usage

```typescript
import { Service, Mandarine } from "https://deno.land/x/mandarinets@v2.1.6/mod.ts";

@Service()
export class UserDetailsServiceImplementation implements Mandarine.Security.Auth.UserDetailsService {
    public users: Array<Mandarine.Types.UserDetails> = new Array<Mandarine.Types.UserDetails>();

    public loadUserByUsername(username: string) {
        return this.users.find((item: Mandarine.Types.UserDetails) => item.username === username);
    }
}
```