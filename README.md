# Mandarine.TS
[![MandarineTS CI](https://github.com/mandarineorg/mandarinets/workflows/ci/badge.svg)](https://github.com/mandarineorg/mandarinets)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mod.ts)

<img src="https://www.mandarinets.org/assets/images/full-logo-simple.svg" width="180" height="180" />

MandarineTS. A minimalist, decorator-driven, MVC, typescript framework for [Deno](https://deno.land).

## Description
Mandarine is a typescript framework that runs on Deno. Mandarine is used to create scalable and reliable server-side solutions. With the use of OOP (Object-oriented programming) and the benefits of Typescript, Mandarine makes sure to give you a better coding experience not only in terms of design patterns such as Dependency Injection but in terms of readability for enterprise code.

Mandarine is divided into 4 different cores that are used to accomplish the same objective: A high-quality enterprise solution. These cores are: Core, MVC, Data & Security. The 4 different cores perform different tasks in order to bring modularity to your application.

For its MVC Core, Mandarine uses [Oak](https://github.com/oakserver/oak) under the hood as its main HTTP dispatcher.

## Documentation
To see all the available documentation of Mandarine.TS, please [Click here](https://www.mandarinets.org/docs/mandarine/introduction).  
Don't know where to start? [Click here](https://www.mandarinets.org/docs/master/mandarine/hello-world) for our quickstart

## Basic usage

```typescript
import { MandarineCore, Controller, GET } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts"; 

@Controller('/api')
export class Boo {
     
    @GET('/hello-world')
    public helloWorld(): string {
        return "Hello World";
    }

}

new MandarineCore().MVC().run();

// request => http://localhost:4444/api/hello-world => Hello World
```

## Questions
For questions & community support, please visit our [Discord Channel](https://discord.gg/qs72byB) or join us on our [twitter](https://twitter.com/mandarinets).

## MandarineTS Main features
Built-in [Dependency Injection](https://www.mandarinets.org/docs/master/mandarine/dependency-injection) Framework, [Components](https://www.mandarinets.org/docs/master/mandarine/components), [Routes](https://www.mandarinets.org/docs/master/mandarine/routes), [Middleware](https://www.mandarinets.org/docs/master/mandarine/custom-middleware), [Sessions](https://www.mandarinets.org/docs/master/mandarine/session-middleware), [built-in ORM](https://www.mandarinets.org/docs/master/mandarine/data-repositories), [MQL](https://www.mandarinets.org/docs/master/mandarine/mandarine-query-language) (Mandarine Query Language), [Template Engine](https://www.mandarinets.org/docs/master/mandarine/template-engine), [built-in authentication](https://www.mandarinets.org/docs/mandarine/auth-introduction)

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/mandarinets/issues) to provide information about a bug, feature, or improvement you would like.

## Follow us wherever we are going
- Author : [Andres Pirela](https://twitter.com/andreestech)
- Website : https://www.mandarinets.org/
- Twitter : [@mandarinets](https://twitter.com/mandarinets)
- Discord : [Click here](https://discord.gg/qs72byB)


