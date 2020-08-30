# Non-Component Middleware
In many cases, you may not need dependency injection or the use of Mandarine-powered features. For this, you can create your own non-component middleware which only has access to the current request. It is very similar to a Mandarine-powered middleware, but instead of a whole class that can receive injections and is directly connected to Mandarine's core, a non-component middleware is just a plain object with two methods (`onPreRequest` and `onPostRequest`) keeping the same standards: if `onPreRequest` returns false, the request will be cancelled otherwise it will continue.

------------

## Syntax
```typescript
{
    onPreRequest: (request: Mandarine.Types.CurrentRequest, response: Mandarine.Types.CurrentResponse) => boolean;
    onPostRequest: (request: Mandarine.Types.CurrentRequest, response: Mandarine.Types.CurrentResponse) => void;
}
```

## Usage
Non-component middleware are specifically created to target a controller or a HTTP handler through the use of [`@UseMiddleware` decorator](/docs/mandarine/use-middleware-decorator).  

```typescript
export const nonComponentMiddlewareContinueFalse = {
    onPreRequest: (request, response) => { console.log("OnPreRequest"); return true; },
    onPostRequest: (request, response) => console.log("OnPostRequest")
}

@Controller()
@UseMiddleware([nonComponentMiddlewareContinueFalse])
export class MyController {
    @GET('/hello-world')
    public handler() {
        return "Middleware list passed";
    }
}

@Controller()
export class MyController2 {
    @GET('/hello-world')
    @UseMiddleware([nonComponentMiddlewareContinueFalse])
    public handler() {
        return "Middleware list passed";
    }
}
```
