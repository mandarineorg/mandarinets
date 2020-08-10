# Dependency Injection
Dependency Injection (DI) is an important design pattern. Mandarine has its own DI framework built-in, which is used to increase efficiency, readability, and modularity.

Dependencies are essentially classes that rely on other classes (also dependents). Without this pattern, you would usually initialize these classes & you would have control over them but this changes with the DI pattern as _dependents_ are initialized and managed by the DI container, in this case, Mandarine's built-in DI framework.

----

> In Mandarine, Dependencies are also known as [Mandarine-powered components](/docs/mandarine/components).This means, only _Mandarine-powered components_ & [Manual Components](/docs/mandarine/manual-components) can be injected.

----

## Concepts

- The main idea behind Dependency Injection is: **Initialize one** -> **Use everywhere**. This means, all objects injected by the DI container will be injected under the scope of _Singleton_ which means, they will have the same context across your application.

----
> The injection process will take place at _Mandarine Compile Time_ (MCT) without human interaction. At the end of MCT, your application will be ready to be used as it will have all the dependents already injected. 
-----
&nbsp;

## Injetion Validity Table

| Component Type      | Injectable | Allows Injection |
| ------------------- | ---------- | ---------------- |  
| Controller          | No         |  Yes             |
| Middleware          | No         |  Yes             |
| Repository          | Yes        |  No              |
| Component           | Yes        |  Yes             |
| Service             | Yes        |  Yes             |
| Configuration       | Yes        |  Yes             |
| Manual Component    | Yes        |  No              |

-----

<center><img src="https://raw.githubusercontent.com/mandarineorg/mandarinets/master/docs/web/mandarine/images/DependencyInjectionDiagram.svg" /></center>

-----

# Injection Forms

- Constructor-based (**Recommended**)
    - Injections are declared as parameters in the constructor of a class.
- Property-based
    - Injections are declared in properties of a class.

&nbsp;

## The `@Inject` Decorator

**Syntax**:
```typescript
@Inject()
```
&nbsp;

The `@Inject` is used for declaring property-based injections.

```typescript
import { Service, Inject } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

@Service()
export class MyService2 {
    public piNumber(): number {
        return 3.14;
    }       
}

@Service()
export class MyService1 {

    @Inject()
    private readonly service2: MyService2;
}
```

Although property-based injection is available, it is not recommended as it may cause delays in _Typescript compile time_ & modularity issues.

For constructor injection, we can use the above example in the following way:

```typescript
@Service()
export class MyService1 {
    constructor(private readonly service2: MyService2) {}
}
```

> After injections have been resolved at MCT, we will be able to call `MyService2.piNumber()` and we will get `3.14` as returning value. In this process, we never manually initialized `MyService1` and `MyService2`, rather it was resolved by Mandarine.

&nbsp;

----

## The `@Injectable` Decorator
The injectable decorator handles the creation of a manual component. When `@Injectable` is called, it will create a manual component inside the DI container. During MCT, Mandarine will be able to read this external dependency and resolve it. [Click here](docs/mandarine/manual-components) for more information about _manual components_.

**Syntax**:
```typescript
@Inject()
```

**Targets**:
 - Method
     - This method should return an initialized class that will be the reference to the expected object in dependency injection requests.
     
```typescript
import { Service, Configuration Injectable } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

export class MyThirdPartyClass {
    constructor(public readonly name: string) {}
}

@Configuration()
export class MyConfiguration {
    
    @Injectable()
    public MyThirdPartyClass() {
        return new MyThirdPartyClass("Mandarine");
    }    

}

@Service()
export class MyService {
    constructor(private readonly manualComponent: MyThirdPartyClass) {}
}
```
