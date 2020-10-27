# Middleware
Middleware are responsible for adding interceptors to controllers. They are executed **before** and **after** Mandarine Request Time (MRT). They are useful for validations as they can decide whether a request should be processed.

-----
&nbsp;

## Concepts
- Middleware are part of Mandarine's MVC Core
- It accepts the use of dependency injection, however, this type of component is not injectable.

&nbsp;

## Syntax

```typescript
@Middleware(regexRoute: RegExp)
```
- `regexRoute`
    - Required
    - Regular expression of HTTP endpoint url to intercept

## Usage

```typescript
import { Middleware, MiddlewareTarget, ResponseParam } from "https://deno.land/x/mandarinets@v2.1.6/mod.ts";

@Middleware(new RegExp('/api/*'))
export class Middleware1 implements MiddlewareTarget {

    // To be executed on pre-request of a request which url matches the middleware's regular expression route
    public onPreRequest(@ResponseParam() response: any): boolean {
        /**
         * True = the request must continue, 
         * False = the request will stop 
         */
        return true;
    }
    
    // To be executed on post-request of a request which url matches the middleware's regular expression route
    public onPostRequest(): void {
    }

}
```
