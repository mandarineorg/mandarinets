# Parameterized Routes
Parameterized routes help you develop flexible endpoints as they can receive information from the user and transmit it to the back-end by only using the URL. They are a variable in a url.

----

## Concepts

- The variables in a parameterized route must start with `:`
- We can have as many parameterized routes as we want as long as all our variables start with `:` and have different names

&nbsp;

## API

```typescript
import { GET, Controller, RouteParam, MandarineCore } from "https://deno.land/x/mandarinets@v2.1.3/mod.ts";

@Controller()
export class MyController {
    
    @GET('/get-user/:id')
    public httpHandler(@RouteParam() id: number) {
        return `Hello, user with id ${id}`;
    }
    
}

new MandarineCore().MVC().run();
```
