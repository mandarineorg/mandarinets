# Routes

----

## Declaring routes
Routes are declared by using specific decorators (_each route has a different decorator_), these decorators have two parameters:
- Route (_string_):
    - Required
    - Route of the endpoint
        - If the parent [controller](/docs/mandarine/controller) contains a base route, then they will be unified.
- Options ([Mandarine.MandarineMVC.Routing.RoutingOptions](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.Routing.RoutingOptions))
    - Optional
    - Contains:
        - `responseStatus?` [HttpStatusCode](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.HttpStatusCode): Default response code for request.
        - `cors?` [CorsMiddlewareOption](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.CorsMiddlewareOption): CORS configuration (if any) for route.

> You may have repeated routes under different _HTTP methods_. If a route is repeated under the _same HTTP method_, an error will be thrown at Mandarine Compile Time (MCT).
        
&nbsp;

> Routes can take regular expressions in string format such as wildcards. <br> For example, `/(.*)` would be a valid route.

&nbsp;

## Priority / Hierarchy
- If a resource exists and its location collides with an existing route, the resource will be prioritized over **any** route.
- If a wildcard route exists & collides with an existing route, the existing route will be prioritized over the wildcard route thus making the wildcard route an ignored route.

&nbsp;

## Types of Routes Available
[See enum here](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.HttpMethods)

- GET
- POST
- PUT
- HEAD
- DELETE
- OPTIONS
- PATCH

&nbsp;

## API

```typescript

import { GET, POST, PUT, HEAD, DELETE, OPTIONS, PATCH, Controller, MandarineCore } from "https://x.nest.land/MandarineTS@1.2.2/mod.ts";

@Controller()
export class MyController {
    
    @GET('/hello-world')
    public httpHandler() {
        return "You have requested me. Hello World";
    }
    
}

new MandarineCore().MVC().run();
```

> Note that in the example above we are only using GET, but all the route types listed above are available to be used. For example, if you would like to use POST instead of GET, it would be:

```typescript

@Controller()
export class MyController {
    ...
    @POST('/hello-world')
    ...
}
...
```
