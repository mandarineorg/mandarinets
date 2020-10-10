# Pipes
Pipes are methods used to transform a value into another. Pipes are useful during requests in order to have a clean value when the request reaches the HTTP Handler.

------

## Concepts
In Mandarine, a pipe can be:
- A Mandarine-powered component that implements [Mandarine.Types.PipeTransform](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/Mandarine.commonInterfaces.ns.ts#MandarineCommonInterfaces.PipeTransform)
- A regular function that receives at least one parameter and returns a new value such as [`parseInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt)

---------

# `@Pipe` decorator

## Syntax
Targets: HTTP Parameter
```typescript
@Pipe(pipes: Array<any> | any)
```

- If pipes is array, then the pipes will be executed in the order they were added.
- If only a single pipe is needed, you can pass a single reference to a function or a Mandarine-powered component without using declaring an array.

------------

## Usage
```typescript
import { UseGuards, Guard, GuardTargetMethod, GuardTarget, Controller, GET } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";

@Component()
export class MymathService implements Mandarine.Types.PipeTransform {
    public transform(value: any): any {
        return value * 2;
    }
}

@Controller()
export class MyController {
    @GET('/hello-world')
    public httpHandler(@Pipe([parseInt, MymathService]) @QueryParam('number') myPipe: number) {
        return {
            typeof: typeof myPipe,
            value: myPipe
        }
    }
}
```
After request `http://localhost:8080/hello-world?number=10`
```json
{
    "typeof": "number",
    "value": 20
}
```

In the above example, `parseInt` is called and then when the value from the query parameter `number` which is initially an string, becomes a number through the first pipe, the second pipe is called which multiplies the value of the previous pipe by 2.

