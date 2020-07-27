# Mandarine.TS
[![MandarineTS CI](https://github.com/mandarineorg/mandarinets/workflows/ci/badge.svg)](https://github.com/mandarineorg/mandarinets)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mod.ts)

<img src="https://www.mandarinets.org/assets/images/full-logo-simple.svg" width="180" height="180" />

MandarineTS. A minimalist, decorator-driven, MVC, typescript framework for [Deno](https://deno.land).  

[Official website](https://www.mandarinets.org)

## Documentation
To see all the available documentation of Mandarine.TS, please [Click here](https://www.mandarinets.org/docs/mandarine/introduction).  
Don't know where to start? [Click here](https://www.mandarinets.org/docs/master/mandarine/hello-world) for our quickstart

## Basic usage

```typescript
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
Built-in [Dependency Injection](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/dependency-injection) Framework, [Components](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/components/component), [Automatization for routes creation](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/controllers/using-routes-and-http-handlers), [Middleware](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/custom-middleware), [Sessions](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/session-middleware), [built-in ORM](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-data/orm), [MQL](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-data/mandarine-query-language) (Mandarine Query Language), [Template Engine](https://mandarineframework.gitbook.io/mandarine-ts/mandarine-mvc/template-engine)

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/mandarinets/issues) to provide information about a bug, feature, or improvement you would like.
