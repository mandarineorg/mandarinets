# `@UseMiddleware` Decorator
With the `@UseMiddleware` decorator, you can target [Mandarine-powered middleware](/docs/mandarine/custom-middleware) or [non-component middleware](/docs/mandarine/non-component-middleware) to HTTP handlers or controllers.

--------------

> `@UseMiddleware` only receives non-component **mandarine** middleware or _Mandarine-powered middleware_. This means, you cannot use external middleware such as Oak middleware.

## Overview
Mandarine provides you with two different types of Middleware: A [Mandarine-powered middleware](/docs/mandarine/custom-middleware) or a non-component middleware with access to the request context. In some scenarios, the _regular expression_ taken by a [Mandarine-powered middleware](/docs/mandarine/custom-middleware) will be enough. Although, this process can perhaps make your code less readable as it grows, for that reason, the `@UseMiddleware` decorator is available.  

`@UseMiddleware` decorator allows you to positionate your middleware in the code you are targetting without having to split it in different files or without having to deal with the boilerplate of a regular expression that intercepts a request based on a route. This way, you can have an assumption of what is happening under the hood at a controller level or HTTP handler level at first sight.

## Syntax
Targets: HTTP Handler | Controller
```typescript
@UseMiddleware(middlewareList: Array<NonComponentMiddlewareTarget | any>)
```
- `@UseMiddleware` targets a controller or HTTP handler or a mix of both.
- `@UseMiddleware` executes the list of middleware in the order they were added.
    - If one middleware fails, the rest of them will fail. This means, all middleware must succeed (return true) in order to allow the request to take place.

## Usage

```typescript
export const nonComponentMiddlewareContinueFalse = {
    onPreRequest: (request, response) => { console.log("OnPreRequest"); return true; },
    onPostRequest: (request, response) => console.log("OnPostRequest")
}

@Middleware()
export class MyMandarinePoweredMiddleware {
    public onPreRequest(@ResponseParam() response: any): boolean {
        console.log("pre-request()");
        return true;
    }
    public onPostRequest(): void {
        console.log("post-request()");
    }
}

@Controller()
@UseMiddleware([MyMandarinePoweredMiddleware])
export class MyController2 {
    @GET('/hello-world')
    @UseMiddleware([nonComponentMiddlewareContinueFalse, MyMandarinePoweredMiddleware])
    public handler() {
        return "Middleware list passed";
    }
}
```