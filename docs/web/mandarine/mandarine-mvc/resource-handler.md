# Resource Handler
The Resource Handler Interface ([See Interface here](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/Mandarine.ns.ts#Mandarine.MandarineCore.IResourceHandler)) allows you to create a resource handler that can be added to the Resource Handler Registry.

----

## Methods

| Name | Description |
| ---- | ----------- |
| addResourceHandler | Adds one or multiple RegExp route to be intercepted. When intercepted, `resourceResolver` will be invoked. |
| addResourceHandlerLocation | Adds one or multiple locations where the resources are located internally. |
| addResourceHandlerIndex | Adds one or multiple paths to index files for each resource location. |
| addResourceCors | Adds a CORS configuration to be applied when requesting the static content configured. |
| addResourceResolver | Adds the resolver that will read & resolve the requests for declared routes. |

## API

```typescript

new ResourceHandler()
            .addResourceHandler(
            new RegExp("/js/(.*)"),
            new RegExp("/css/(.*)"), 
            new RegExp("/(.*)")
            )
            .addResourceHandlerLocation(
            "./src/main/resources/static/js", 
            "./src/main/resources/static/css", 
            "./src/main/resources/static")
            .addResourceHandlerIndex(
            undefined, 
            undefined, 
            "index.html")
            .addResourceResolver(new MandarineResourceResolver())
```

In the above example, we are declaring that routes starting with `/js/` should go to `./src/main/resources/static/js` and so on. We are also defining that the root routes (`/(.*)`) should have an index file which is `index.html` in `./src/main/resources/static`
Our resolver for such requests is `MandarineResourceResolver` , which is the default resolver by Mandarine. This resolver is used in Mandarine static content, but it can also be used for multiple handlers.
