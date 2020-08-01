# HTTP Handlers
HTTP Handlers are methods previously decorated with a router decoration ([See more here](/docs/mandarine/routes)). These specific methods will be responsible for handling & resolving a request made to the specific endpoint. HTTP handlers **are only valid** inside [Controllers](/docs/mandarine/controller)

----

## HTTP Parameter Decorators
They are decorators that are used in the parameters of a HTTP Handler. Every decorator provides a different functionality, but the objective is the same for all of them: The interaction of the current request & your Mandarine-powered web application.

> These decorators target the parameters of an HTTP Handler.

| Syntax | Description | Required Parameters |
| ------ | ----------- | -------- |
| `@RouteParam(name?: string)` | It will retrieve the value of the param declared on the route path. This value comes from the client's request. <br> `name` is used to identify what parameter from the route path we are trying to get <br> If `name` is ignored, then its value will be the parameter's key. | None
| `@QueryParam(name?: string)` | It will retrieve the value of the desired query parameter. This value comes from the URL a client has requested. <br> `name` is used to identify what query parameter from the request's url we are trying to get <br> If `name` is ignored, then its value will be the parameter's key. | None
| `@RequestBody()` | It will retrieve the value from request's body. <br> It is the equivalent to [request.body()](https://doc.deno.land/https/raw.githubusercontent.com/oakserver/oak/master/request.ts#Request). <br> Mandarine will try to parse it when the content type of the body is **application/x-www-form-urlencoded**, **application/json** or **multipart/form-data** . If the content-type is not known, the whole body object will be inject it instead. | None
| `@Session()` | It will retrieve the current session object located inside the request. | None
| `@Cookie(name?: string)` | It will bring the cookie with the key `name` <br> `name` is used to identify what cookie from the request we are trying to get <br> If `name` is ignored, then its value will be the parameter's key. | None
| `@ServerRequestParam()` | It will retrieve all the information available from the request made by a client. <br> The result is a [ServerRequest](https://doc.deno.land/https/raw.githubusercontent.com/denoland/deno/master/std/http/server.ts#ServerRequest) object | None
| `@RequestParam()` | It will retrieve all the information available from the request made by a client. <br> The result is a [Request](https://doc.deno.land/https/raw.githubusercontent.com/oakserver/oak/master/request.ts#Request) object from Oak. | None
| `@ResponseParam()` | It will retrieve the value from the current response given by the server before being delivered to the client. <br **Note that** modifications to the request can and will affect the outcome of the response delivered to the client after the HTTP handler has been executed. | None
| `@Model()` | It will inject the [ViewModel](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/core/modules/view-engine/viewModel.ts) object, used to create data models for templates. | None
| `@Parameters()` | It will inject an object of interface [`AllParameters`](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/develop/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.AllParameters). This object will have all the parameters (both route parameters and query parameters) present in the request. | None

## API

```typescript
import { Controller, GET, RouteParam, MandarineCore } from "https://x.nest.land/MandarineTS@1.2.2/mod.ts";

@Controller('/api')
export class Foo {
     
    @GET('/say-hi/:personsName')
    public httpHandler1(@RouteParam() personsName: string): string {
        return `Hello ${personsName}, welcome to Mandarine.TS`;
    }
    
    // This one specifies manually what parameter we are trying to get
    @GET('/say-hello/:name')
    public httpHandler2(@RouteParam('name') personsName: string): string {
        return `Hello ${personsName}, welcome to Mandarine.TS`;
    }

}

new MandarineCore().MVC().run();
```
**Result**
```http request
# http://localhost:8080/api/say-hi/Bill
Hello Bill, Welcome to Mandarine.TS

# http://localhost:8080/api/say-hello/Mark
Hello Mark, Welcome to Mandarine.TS
```
