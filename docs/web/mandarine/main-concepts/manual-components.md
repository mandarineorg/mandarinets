# Manual Components
Mandarine's manual components are used when wanting to _Mandarine-power_ a third-party code, this essentially means, manual components allow you to connect non Mandarine-powered code with Mandarine's dependency injection system as well as Mandarine's cores.

-----
&nbsp;

## Concepts
- They **are not** part of Mandarine's native components.
- They are declared manually by the user.
    - After a manual component is detected by the Dependency Injection (DI) container, it will be usable across the application.
- Manual components provides flexibility for third-pary libraries or existent code.

&nbsp;

## Usage

> The @Injectable decorator handles the creation & representation of a non-native Mandarine component inside the DI container. This means, @Injectable creates a manual component under the hood.

Usage example:
```typescript
import { Configuration, Injectable, Component, Inject } from "https://deno.land/x/mandarinets@v2.1.5/mod.ts";

export class ManualInjectionService {

    public name: string;

    constructor(name: string) {
        this.name = name;
    }

    public helloWorld(): string {
        return `Hello ${this.name}`;
    }

}

@Configuration()
export class MainConfig {

    @Injectable()
    public ManualInjectionService() {
        return new ManualInjectionService("Bill");
    }

}

@Component()
export class MyComponent {

    @Inject()
    public service: ManualInjectionService;

    public getResult(): string {
        return this.service.helloWorld();
    }
}
```

> In the example above, we are injecting `ManualInjectionService`, even though it is not a valid Mandarine-powered component, we are making it valid & readable for the DI container by declaring it with @Injectable as shown above. This way, when we call `MyComponent.getResult()`  we will get `"Hello Bill"`.
