# Authenticator as Injectable
With Mandarine's built-in authenticator, you may use the logic behind [Mandarine's built-in authentication](/docs/master/mandarine/auth-introduction) without having to necessarily depend on using the whole system.

-----------

## Use Cases
Using Mandarine's built-in authenticator gives you control over calling it in the way you desire. This means, you could optionally create an endpoint rather than using Mandarine's built-in endpoint & logic behind the authentication process. On the other side, you could verify whether an user's name & password are correct multiple times in a functional way without having to call an endpoint. The mentioned use cases are just some among many.

## Methods

| Method | Description |
| ------ | ----------- |
| `getAuthenticationId(requestContext: Mandarine.Types.RequestContext)` | Gets the session id (if any) of the current authentication present in the request |
| `performAuthentication(data: Mandarine.Security.Auth.PerformAuthenticationOptions)` | Executes an authentication attempt and returns information about whether it was successful & the user principal. If the authentication was not successful then the user principal is **undefined** |
| `performHTTPAuthentication(data: Mandarine.Security.Auth.PerformHTTPAuthenticationOptions)` | Executes an authentication attempt in the current request and returns information about whether it was successful & the user principal. If the authentication was not successful then the user principal is **undefined** <br> This method should only be used when wanting to programatically log-in without using Mandarine's built-in system for this, as this method will inject the authentication data in the session container and request context if successful. |
| `stopHTTPAuthentication(data: Mandarine.Types.RequestContext)` | Removes the current authentication context from the request & the session container which will make the user sending the request log out. <br> This method should only be used when wanting to programatically log-out without using Mandarine's built-in system for this. |

## Usage

```typescript
import { Authenticator } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts"; 

@Service()
export class MyService {
    constructor(logger: Authenticator) {}
}
```