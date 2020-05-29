# Mandarine.TS
![Mandarine.ts Logo](https://user-images.githubusercontent.com/60560109/81625975-6c6c4a80-93c8-11ea-8cd3-c5718fd56d52.png)

MandarineTS is a typescript framework for creating websites using the Model-View-Controller pattern (MVC). The use of typescript functionalities such as its decorators make this framework adaptable to many use cases and design patterns.  
MandarineTS aims to provide an affordable and easy way to create typescript web-applications that run on **[Deno](https://deno.land/)**.  

With the use of multiple systems and design patterns, Mandarine offers you the ability to develop complex MVC web applications. Dependency Injection & Components are one of the few things you can take advantage of.

## Documentation
To see all the available documentation of Mandarine.TS, please [Click here](https://mandarineframework.gitbook.io/mandarine-ts/).  
[Click here](https://mandarineframework.gitbook.io/mandarine-ts/getting-started) to see how to set-up your Mandarine application

## Basic usage

```
@Controller('/api')
export class Boo {
     
    @GET('/hello-world')
    public helloWorld(): string {
        return "Hello World";
    }

}

new MandarineCore.MVC().run();

# request => http://localhost:4444/api/hello-world => Hello World
```

**Note** tsconfig.json file is required, please refer to [this link](https://mandarineframework.gitbook.io/mandarine-ts/getting-started#typescript-configuration) to understand more.
## Mandarine.TS Main features
Built-in [Dependency Injection](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/dependency-injection) Framework, [Components](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/components/component), [Automatization for routes creation](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/controllers/using-routes-and-http-handlers), [Middlewares](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/custom-middleware), [Sessions](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/session-middleware), [built-in ORM](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-data/orm), [MQL](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-data/mandarine-query-language) (Mandarine Query Language), [Template Engine](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/template-engine)

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/mandarinets/issues) to provide information about a bug, feature, or improvement you would like.
