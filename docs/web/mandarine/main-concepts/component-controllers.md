# Controllers
Controllers are responsible for dealing with Mandarine's HTTP Dispatcher & your application. Controllers are an special kind of component are they are the only ones who can handle the creation of endpoints as well as the communication of requests and your application's layer.

-----
&nbsp;

## Concepts
- Controllers are part of Mandarine's MVC Core
- It accepts the use of dependency injection, however, this type of component is not injectable.

&nbsp;

## Syntax

```typescript
@Controller(baseRoute?: string)
```
- `baseRoute`
    - Optional
    - Base route for endpoints


**Note** that if `baseRoute` is provided, all the endpoints under the controller will work under the base route.

&nbsp;

## Usage

```typescript
import { Controller } from "https://deno.land/x/mandarinets@v2.2.1/mod.ts";

@Controller()
export class MyController {
}
```
----
```typescript
import { Controller } from "https://deno.land/x/mandarinets@v2.2.1/mod.ts";

@Controller('/api')
export class MyController {
}
```
