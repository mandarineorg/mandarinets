# CORS Middleware
The CORS middleware allows you to enable or disable [Cross-origin resource sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing). This way, you can protect your endpoints from being requested from unknown origins or undesired origins.

---

CORS middleware is added through the use of decorators.

**Syntax**

`@Cors(corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption)`

- See [Mandarine.MandarineMVC.CorsMiddlewareOption](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.CorsMiddlewareOption)

**Mandarine.MandarineMVC.CorsMiddlewareOption**
- `origin`
    - Declares the valid origins. It can be a **string**, a **RegExp**, or an array of both **string** & **RegExp** for multiple origins.
    - Default: `*`
- `methods`
    - Methods allowed
    - Default: `["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]`
- `allowedHeaders`
    - List of headers to be added to `access-control-request-headers`
- `exposedHeaders`
    - List of headers to be added to `access-control-expose-headers`
- `credentials`
    - Boolean value for header `access-control-allow-credentials`
- `maxAge`
    - Value for header `access-control-max-age`
- `optionsSuccessStatus`
    - Http response code for when CORS has been accepted.
    - Default: **204**


## API
**Controller level**
```typescript

import { Controller, GET, Cors } from "https://deno.land/x/mandarinets@v2.1.5/mod.ts";

@Controller('/api')
@Cors({ origin: "https://myorigin.com" })
export class MyApi {

    @GET('/hello')
    public handler() {
        return "hello";
    }

}
```

**Route level**
```typescript
@Controller('/api')
export class MyApi {

    @GET('/hello')
    @Cors({ origin: "https://myorigin.com" })
    public handler() {
        return "hello";
    }
    
}
```
