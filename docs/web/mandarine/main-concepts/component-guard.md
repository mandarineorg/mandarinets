# Guard
A guard component is generally a Mandarine-powered class part of Mandarine's stereotypes but it can be a method if not complex logic involving dependency injection is needed. Guard components have a single responsability which is to protect an endpoint based on some logic.
Guard component implements [GuardTarget](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/internals/interfaces/guardTarget.ts) or if it is a method, the method should have the [GuardTargetMethod](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/develop/main-core/internals/interfaces/guardTarget.ts#GuardTargetMethod) signature.  

----------------

## Concepts
- Guard components are part of Mandarine's main core.
- They should be created only to protect endpoints
- It is not injectable but it **does** accept injections.  

&nbsp;

## Component Syntax
```typescript
@Guard()
export class GuardComponent implements GuardTarget {
}
```

## Functional Syntax
```typescript
const myGuard: GuardTargetMethod = (requestContext: Mandarine.Types.RequestContext) => {}
```

&nbsp;

-----------

# `@UseGuards` Decorator

## Syntax
- Target: Controller | HTTP Handler
```typescript
@UseGuards(guardsList: Array<GuardTarget | any>)
```

- The `@UseGuards` decorator is a decorator that targets both a HTTP Handler or a controller. If the target is a _HTTP Handler_, it will only be applied to that specific route, on the other side, if the target is a _controller_, it will be applied to all the routes under it.
- If `@UseGuards` targets both a controller & a HTTP Handler, then the process will start at a controller level and if it succeeds, then it will evaluate the HTTP handler.
- The `@UseGuards` decorator takes an argument which is an array. This array will contain references to the methods or types of a Mandarine-powered component.
- The `@UseGuards` decorator executes the list of guards previously declared in the order they were added.
    - When a guard fails, the loop is broken & the request gets unauthorized thus throwing a 401 error.
    - **If and only if** all the guards in the array are successful, the request will pass. 

------------

## Usage

```typescript

import { UseGuards, Guard, GuardTargetMethod, GuardTarget, Controller, GET } from "https://deno.land/x/mandarinets@v2.1.1/mod.ts";

@Guard()
export class GuardComponent implements GuardTarget {
    onGuard(request: Mandarine.Types.RequestContext) {
        // Assumming request has a property called user, it must not be undefined
        return request.getRequest().user != undefined;
    }
}

const functionalGuard: GuardTargetMethod = (requestContext: Mandarine.Types.RequestContext) => {
    // Assumming request has a property called user which has a property called "role" where role **must be** ADMIN
    return request.getRequest().user["role"] === "ADMIN"
}

@Controller()
@UseGuards([GuardComponent])
export class MyController {
    @GET('/logged-in')
    public httpHandler() {
        return "You are Logged-in";
    }

    @GET('/admin')
    @UseGuards([functionalGuard])
    public httpHandler2() {
        return "You are admin";
    }
}

```

&nbsp;

## HTTP Parameter Decorators
Guard components are invoked during a request, this means, they are completely compatible with [HTTP Parameter Decorators](/docs/master/mandarine/http-handlers)