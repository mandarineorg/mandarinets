# Resource Handlers
Resource handlers are a way to intercept and resolve a specific resources requested by a client. They work as a form of middleware interceptor.  

A good example of a resource handler is the way mandarine handles static content. Internally, Mandarine has a Resource Handler that will get the requested file based on the URL of the request.

----

## Overriding Behavior
It is possible to create your own resource handlers & resource resolvers. For this, Mandarine allows you to implement Mandarine.MandarineMVC.Configurers.WebMVCConfigurer which will override the default behavior established by Mandarine.

In order to override this behavior, create a component ([Configuration component](/docs/mandarine/configuration) is recommended). This component must implement Mandarine.MandarineMVC.Configurers.WebMVCConfigurer.

```typescript
import { Mandarine, Configuration } from "https://x.nest.land/MandarineTS@1.4.0/mod.ts";

@Configuration()
export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer {

}
```

Then, we need to override the method addResourceHandlers , which we will also need to decorate with `@Injectable()`

```typescript

@Configuration()
export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer {

    @Injectable()
    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
    }
    
}
```

Our method addResourceHandlers will return an instance of the Resource Handler Registry with our resource handlers now added.

```typescript

import { Mandarine, Configuration, ResourceHandler, MandarineResourceResolver } from "https://deno.land/x/mandarinets/mod.ts";

@Configuration()
export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer {

    @Injectable()
    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        /**
         * Using `getNew()` : Mandarine.Global.getResourceHandlerRegistry().getNew()
         * will override the static content handler Mandarine has predefined.
         * This will mean you will have to add a Resource Handler to handle static content.
         * Do not use `getNew()` in order to keep the default static content handler.
         */
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry();
        // Or let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry().getNew();
        
        resourceHandlerRegistry.addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/css/(.*)"))
            .addResourceHandlerLocation("./src/main/resources/static/css")
            .addResourceCors({
                origin: "https://stackoverflow.com"
            })
            .addResourceResolver(new MandarineResourceResolver())
        ).addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/js/(.*)"))
            .addResourceHandlerLocation("./src/main/resources/static/js")
            .addResourceResolver(new MandarineResourceResolver())
        );

        return resourceHandlerRegistry;
    }

}
```

In the example above, we are adding a resource handler that will be executed every time our client requests "/css" or "/js".
