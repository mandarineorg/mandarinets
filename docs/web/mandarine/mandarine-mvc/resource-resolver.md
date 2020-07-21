# Resource Resolver

The Resource Resolver interface ([See interface here](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.HTTPResolvers.ResourceResolver)) is responsible for resolving a Resource Handler and finally returning the requested resource in form of Uint8Array which will then be reflected on the response body.  The Resource Resolver implementation is used in [Resource Handlers](/docs/mandarine/resource-handler).

----

## Methods

| Name | Description | Arguments |
| ---- | ----------- | --------- |
| resolve | Resolves the resolve handler | httpContext: Context of the incoming HTTP request (This parameter is injected by Mandarine's Resource Handler Middleware). <br> resourcePath: It is the path of the requested resource (This parameter is injected by Mandarine's Resource Handler Middleware) |

## Mandarine Default Resource Resolver
Mandarine has a default resource resolves which is used to handle static content.
