# Hello World
Mandarine has a very simple & straightforward way to be written, this is what makes Mandarine a great framework when it comes to **architecture challenges**.

```typescript
// myFile.ts

import { MandarineCore, Controller, GET } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";

@Controller()
export class MyController {
    
    @GET('/hello-world')
    public httpHandler() {
        return "Welcome to MandarineTS Framework!";
    }

}

new MandarineCore().MVC().run();
```

Terminal

```shell script
$ deno run -c tsconfig.json --allow-net --allow-read --allow-env myFile.ts
```
