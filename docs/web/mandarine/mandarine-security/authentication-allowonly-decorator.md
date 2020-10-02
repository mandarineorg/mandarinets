# `@AllowOnly` Decorator
The `@AllowOnly` decorator protects an endpoint with Mandarine's built-in authentication system. If you are using Mandarine's built-in authentication system, the `@AllowOnly` decorator will save you the time writing middleware to protect endpoints against an specific role or security expression.


-------

## Syntax
- Target: Controller | HTTP Handler
```typescript
@AllowOnly(permissions: Mandarine.Security.Auth.Permissions)
```

- If `@AllowOnly` targets a controller, all the endpoints under such will be protected.
- If `@AllowOnly` targets a HTTP Handler, **only** the specific endpoints will be protected.
- If `@AllowOnly` is mixed and targets both a HTTP handler and a Controller, then the protection will start at the controller level and if it succeeds, then the protections at the HTTP handler level will be executed.

## `Mandarine.Security.Auth.Permissions` interface
- It can take a string array or a single string.
- An array is used to describe what roles will have access, although, _security expressions_ are allowed.
- If you are only going to make use of security expressions, we recommend using a single string.

&nbsp;

## Usage
```typescript
import { Controller, GET, AllowOnly } from "https://deno.land/x/mandarinets@v2.1.0/mod.ts";

// Only Controller
@Controller()
@AllowOnly(["isAuthenticated()", "ADMIN"])
export class mycontroller {
    @GET('/authenticated-and-admin')
    public handler() {
        return "You are authenticated and are admin";
    }
}

// Only HTTP Handlers
@Controller()
export class moderatoradmin {
    @GET("/admin")
    @AllowOnly(["ADMIN"])
    public handler() {
        return "You are admin";
    }
}

// Both, Controller & HTTP Handlers
@Controller()
@AllowOnly(["isAuthenticated()"])
export class allowonlyclass {

    @GET("/only-admins")
    @AllowOnly(["ADMIN"])
    public handler1() {
        return "You are admin and are authenticated";
    }
}
```