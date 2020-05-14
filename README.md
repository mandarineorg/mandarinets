# Mandarine.TS
![Mandarine.ts Logo](https://user-images.githubusercontent.com/60560109/81625975-6c6c4a80-93c8-11ea-8cd3-c5718fd56d52.png)

MandarineTS is a typescript framework for creating websites using the Model-View-Controller pattern (MVC). The use of typescript functionalities such as its decorators make this framework adaptable to many use cases and design patterns.  
MandarineTS aims to provide an affordable and easy way to create typescript web-applications that run on **[Deno](https://deno.land/)**.  

With the use of multiple systems and design patterns, Mandarine offers you the ability to develop complex MVC web applications. Dependency Injection & Components are one of the few things you can take advantage of.

## Documentation
To see all the available documentation of Mandarine.TS, please [Click here](https://github.com/mandarineorg/mandarinets/wiki)
### [Click here to see our To-Do list](https://github.com/mandarineorg/mandarinets/wiki/TO-DO's)
## Basic usage

```
@Controller('/api')
export class Boo {
     
    @GET('/hello-world')
    public helloWorld(): string {
        return "Hello World";
    }

}

new MandarineMVC().run();

# request => http://localhost:4444/api/hello-world => Hello World
```
## Mandarine.TS Main features
Built-in Dependency Injection Framework, Components, Automatization for routes creation, Middlewares, Sessions, 

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/mandarinets/issues) to provide information about a bug, feature, or improvement you would like.
