# `@ResponseStatus` Decorator
By using the `@ResponseStatus` decorator, it is possible to specify a response status at a controller level, this means, it will be applied to all your endpoints inside your controller.

----

## Syntax
```typescript
@ResponseStatus(httpCode: Mandarine.MandarineMVC.HttpStatusCode)
```
> The `@ResponseStatus` decorator must always be located at a class level, otherwise it will have no effect


&nbsp;

## API

```typescript
import { Mandarine, Controller, ResponseStatus } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

@Controller()
@ResponseStatus(Mandarine.MandarineMVC.HttpStatusCode.OK)
export class MyController {
}
```
