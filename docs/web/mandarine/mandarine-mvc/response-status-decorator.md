# `@ResponseStatus` Decorator
By using the `@ResponseStatus` decorator, it is possible to specify a response status at a controller level and HTTP handler, this means, it will be applied to all your endpoints inside your controller or an specific route if desired.

----

## Syntax
Targets: Controller | HTTP Handler
```typescript
@ResponseStatus(httpCode: Mandarine.MandarineMVC.HttpStatusCode)
```

&nbsp;

## Usage

```typescript
import { Mandarine, Controller, ResponseStatus, GET } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts";

@Controller()
@ResponseStatus(Mandarine.MandarineMVC.HttpStatusCode.OK)
export class MyController {
}

@Controller()
export class MyController2 {

    @GET('/endpoint')
    @ResponseStatus(Mandarine.MandarineMVC.HttpStatusCode.OK)
    public httpHandler() {
        return "Hello World"
    }

}
```
