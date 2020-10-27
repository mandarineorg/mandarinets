# Catch
A catch component is a Mandarine-powered class part of Mandarine's stereotypes. Catch components have a single responsability which is intercepting exceptions during requests. Catch component implements [**ExceptionFilter**](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/develop/main-core/internals/interfaces/exceptionFilter.ts#ExceptionFilter)

--------

## Concepts
- Catch components are part of Mandarine's main core.
- They only catch exceptions taking place during a request of Mandarine MVC.
- It is not injectable but it **does** accept injections.  

&nbsp;

## Syntax

```typescript
@Catch(error: any extends Error)
export class MyCatchComponent implements ExceptionFilter {
}
```

## Usage

```typescript
import { Catch, ExceptionFilter, ExceptionContext } from "https://deno.land/x/mandarinets@v2.1.5/mod.ts";

@Catch(MyException)
export class MyCatchComponent implements ExceptionFilter<MyException> {
    catch(exceptionContext: ExceptionContext<MyException>) {
        console.log("An error has occured");
        exceptionContext.getResponse().body = {
            msg: exceptionContext.getException().toString()
        }
    }
}
```

## HTTP Parameter Decorators
Catch components are invoked during a request, this means, they are completely compatible with [HTTP Parameter Decorators](/docs/master/mandarine/http-handlers)

