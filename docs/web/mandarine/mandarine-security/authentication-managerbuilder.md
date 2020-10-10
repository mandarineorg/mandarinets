# Authentication Manager Builder

------

## Overview
The authentication manager builder is a module part of [`WebMVCConfigurer`](/docs/master/mandarine/native-components-list) which allows adding an `UserDetailsService` to the authentication container which holds all the logic behind Mandarine's built-in authentication.  
The authentication manager builder also allows overriding the default implementation of the password encoder (By default, Mandarine makes use of [BCrypt](https://en.wikipedia.org/wiki/Bcrypt), although, this implementation can be overriden).

## `Mandarine.Security.Auth.AuthenticationManagerBuilder` interface
```typescript
export interface AuthenticationManagerBuilder {
    userDetailsService: (implementation: any) => AuthenticationManagerBuilder;
    passwordEncoder: (implementation: Crypto.PasswordEncoder) => AuthenticationManagerBuilder;
}
```
- `userDetailsService`:
    - Passes the reference to the Mandarine-powered component that implements `Mandarine.Types.UserDetailsService`
- `passwordEncoder`: **Method**
    - Passes an instance that implements `Mandarine.Security.Crypto.PasswordEncoder`.
    - Default is _BCrypt_

## Basic Usage

```typescript
import { Override, Mandarine } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";

@Override()
export class WebMvcConfigurer extends Mandarine.Native.WebMvcConfigurer {
    public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
        provider = provider.userDetailsService(UserDetailsService);
        return provider;
    }
}
```
