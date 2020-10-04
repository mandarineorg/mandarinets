# HTTP Parameter Custom Decorators
The Custom Decorators concept allows you to create your own HTTP Parameters which will be resolved during the request. If you do not know what an HTTP Parameter is, please refer to [this link](/docs/mandarine/http-handlers)

--------------

## Overview
Mandarine provides a parameter factory which lets you create your own decorator.

## Syntax
```typescript
parameterDecoratorFactory<DecoratorData = any>(executor: Mandarine.MandarineMVC.CustomDecoratorExecutor) => (...data) => (target: any, methodName: string, index: number);
```

- `executor`
    - The `executor` is a function that takes in its first argument, the argument context which is part of `Mandarine.Types.RequestContextAcessor`, and a second or multiple arguments which are related to the data of the decorator.

## Example
```typescript
import { parameterDecoratorFactory, Controller, GET } from "https://deno.land/x/mandarinets@v2.1.1/mod.ts";

const RandomNumberDecorator = parameterDecoratorFactory((context, parameter) => {
    return Math.round(Math.random() * parameter);
});

@Controller()
export class MyController {
    @GET('/hello-world')
    public httpHandler(@RandomNumberDecorator(10) randomNumber: number) {
        return `Random number generated ${randomNumber}`;
    }
}
```

&nbsp;

## Generic
Optionally, you can provide a data type for the data the decorator will receive.
```typescript
const RandomNumberDecorator = parameterDecoratorFactory<number>((context, parameter) => {
    return Math.round(Math.random() * parameter);
});
```
This way, you will get a typescript error if your decorator (in this case `RandomNumberDecorator`) receives a different type, or in this case, any other type different from a `number`.