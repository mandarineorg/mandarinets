# Custom Middleware
Custom middleware are used to provide interceptions to certain endpoints in your Application. The use cases may vary, but the most common use cases are verifications.
In order for a middleware to be considered a mandarine middleware, your middleware class needs to implement the class [MiddlewareTarget](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/components/middleware-component/middlewareTarget.ts).

## `MiddlewareTarget`
_`MiddlewareTarget`_ contains two key methods which you will need to provide functionality.

| Method Name | Description |
| ----------- | ----------- |
| `onPreRequest(...args): boolean` | It is executed before the request reaches to the [HTTP Handler](/docs/mandarine/http-handlers). <br> If it returns **true**, the request is **authorized** to continue to the HTTP handler & then to the post-request handler. If it returns **false** the request will be **aborted**.
| `onPostRequest(...args): void` | It is executed after the request has reached & called the HTTP handler. <br> Sometimes useful for things such as adding final data to a session.

> `onPreRequest` and `onPostRequest` may make use of all [HTTP parameter decorators](/docs/mandarine/http-handlers).

&nbsp;

## API

```typescript

// middleware.ts

import { Middleware, MiddlewareTarget, ResponseParam, Controller, GET, MandarineCore } from "https://x.nest.land/MandarineTS@1.2.1/mod.ts";

@Middleware(new RegExp('/api/*'))
export class Middleware1 implements MiddlewareTarget {

    public onPreRequest(@ResponseParam() response: any): boolean {
        console.log("pre-request()");
        return true;
    }
    
    public onPostRequest(): void {
        console.log("post-request()");
    }
}

@Controller()
export class MyController {

    @GET('/api/hello-world')
    public helloWorldApi() {
        return "Hello world";
    }

}

new MandarineCore().MVC().run();
```

**Result**

```http request
# http://localhost:8080/api/hello-world
[Console] pre-request()
Hello world
[Console] post-request()
```
