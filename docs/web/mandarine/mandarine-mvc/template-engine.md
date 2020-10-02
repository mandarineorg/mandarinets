# Template Engine
Mandarine allows you to render templates in your web application in order to provide more functionality. Templates are usually a type of HTML file with code from the back-end involved, these files are rendered by an engine and displayed on the browser as valid & clean HTML content.
Mandarine has adapted a [third-party view engine](https://github.com/deligenius/view-engine) in order to support natively the concept templates in your Mandarine Application.

---

## Supported Engines
Mandarine supports template rendering for:
- [EJS](https://ejs.co/)
- [Handlebars](https://handlebarsjs.com/)

## Template's directory
By default, Mandarine uses `./src/main/resources/templates` as your project's template folder, this behavior can be changed by [setting your own properties](/docs/mandarine/custom-properties).

----

&nbsp;

# `@Render` Decorator
In order to make an endpoint "_renderable_", it is necessary to decorate your HTTP Handler with the @Render decorator. The @Render decorator will tell Mandarine's MVC core that such endpoint is expecting to be rendered on the client's browser and thus Mandarine's MVC core will be expecting a _renderable_ content.

**Syntax**
```typescript
@Render(template: string, 
options?: Mandarine.MandarineMVC.TemplateEngine.RenderingOptions, 
engine?: Mandarine.MandarineMVC.TemplateEngine.Engines)
```

See [Mandarine.MandarineMVC.TemplateEngine.RenderingOptions](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.TemplateEngine.RenderingOptions)

See [Mandarine.MandarineMVC.TemplateEngine.Engines](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.TemplateEngine.Engines)

- `template`
    - Used to specify the path of your template **inside** your template's directory. This means, you **must not** specify a full path as it will be resolved automatically.
    - Used to specify the content of the template instead of using a file.
        - If a manual template is used, _`Mandarine.MandarineMVC.TemplateEngine.RenderingOptions.manual`_ must be true
- `options`
    - Used to specify the behavior of loading the template. 
        - `manual` If set to true, template is not considered a file but a string content.
- `engine`
    - Engine to be used when rendering the template

```html
# ./src/main/resources/templates/index-template.html

<h2>Hello Bill! Nice to see you here again</h2>
```
```typescript
import { Controller, GET, Render, MandarineCore } from "https://deno.land/x/mandarinets@v2.1.0/mod.ts";

@Controller()
export class MyController {

    @GET('/path-template')
    @Render('index-template.html')
    public httpHandler() {
    }
    
    @GET('/manual-template')
    @Render(`<h2>This is a manual template</h2>`, { manual: true })
    public httpHandler2() {
    }
    
}

new MandarineCore().MVC().run();
```
