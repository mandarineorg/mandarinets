# Accessing data from template
Mandarine's engine allows you to interact and make your templates access data located in your application's back-end. For this, your [HTTP Handler](/docs/mandarine/http-handlers) decorated with [@Render](docs/mandarine/template-engine#-code-render-code-decorator) **must return an object**. This object will then be accessible from the template & it is meant to have the information you would like to interact with.

----

## The `@Model` decorator

**Syntax**
```typescript
@Model()
```

&nbsp;

The `@Model` decorator provides a data modeler for your template in a programmatic way. It is a [HTTP Parameter Decorator](/docs/mandarine/http-handlers), which means, it is used & injected in the parameters of an HTTP handler.

`@Model` working as your data modeler for your template makes your code easier to interact with & more readable. Although, it does not have any important functionality more than serving as a helper for your template's data.

When using [ViewModel](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/core/modules/view-engine/viewModel.ts) (object injected from `@Model`), your method instead of returning an object, must return the instance of `ViewModel` as Mandarine will resolve the attributes added to the modeler at request time.

## API
```html
# EJS Engine
# ./src/main/resources/templates/my-template.html

<h2><%= data.framework %> By <%= data.extra.creator %></h2>
```

```typescript
import { Controller, GET, Render, Model, ViewModel, MandarineCore } from "https://deno.land/x/mandarinets@v2.1.0/mod.ts";

@Controller()
export class MyController {

    @GET('/path-template')
    @Render('my-template.html')
    public httpHandler(@Model() model: ViewModel) {
    
        model.setAttribute("data", {
            framework: "Mandarine",
            extra: {
                creator: "Andres Pirela & The MandarineTS Collaborators"
            }
        });

        // returning ViewModel object.
        return model;
    }
}

new MandarineCore().MVC().run();
```
