# Serving Static Content
Mandarine allows you to configure & server static content in order to provide a straight forward way to access resources your web application may have.

----

## Static Content

By default, Mandarine will serve resolve static contents that are found in the folder `./src/main/resources/static`. These resources will be processed in the root of _your web application url_. For example, if you have a file in your _static folder_ called **mycss.css**, and you need to access it, you would request `http://yourUrl:yourPort/mycss.css`. **Note** that files inside directories are also allowed.

## Configuration

If you wish to set your own behavior for serving your static content, you can customize it by overriding the default properties in your [properties.json](/docs/mandarine/custom-properties).

```typescript
{
    "mandarine": {
            "resources": {
                "staticFolder": "./src/main/resources/static",
                "staticRegExpPattern": "/(.*)",
                "staticIndex": null,
            }
    }
} 
```
- staticFolder
    - Folder where your static resources are located
- staticRegExpPattern
    - **Regular Expression** of URL request to match & intercept in order to serve static content.
        - By default, it is set to `/(.*)`, this means it will be intercepted in the root of your web application as described before. On the other side, if you set it to `/static/(.*)` (_for example_) would serve `http://yourUrl:yourPort/static/`.
- staticIndex
    - Path of index file to be served when requesting the root of the static content (Inside `staticFolder`).
 
---

## CORS
Mandarine does not implement any CORS middleware for static content by default. This behavior must be added through the use of [Resource Handlers](/docs/mandarine/resource-handlers) or through the use of [properties](/docs/mandarine/custom-properties).

See _[Mandarine.MandarineMVC.CorsMiddlewareOption](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.CorsMiddlewareOption)_
See [Mandarine's CORS Middleware](/docs/mandarine/cors-middleware)


```typescript
{
    "mandarine": {
        "resources": {
            "cors": {
                "origin": "http://myweb.com",
                ...
            }
        }
    }
}
```
