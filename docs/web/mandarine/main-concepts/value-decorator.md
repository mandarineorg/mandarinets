# `@Value` Decorator
The `@Value` decorator allows you to access properties from your Mandarine's properties file in a programmatic way, this means, by using the @Value decorator, you can interact with your configuration in your components or native classes.

----

## Syntax
```typescript
@Value(propertyKey: string, scope: Mandarine.MandarineCore.ValueScopes)
```

See [Mandarine.MandarineCore.ValueScopes](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/Mandarine.ns.ts#Mandarine.MandarineCore.ValueScopes)

- propertyKey
    - Key reference of your property. If nested, separate by using dots (.)
- scope
    - `CONFIGURATION`: Retrieves values from property file
    - `ENVIRONMENTAL`: Retrieves values from Deno environmental variables (`Deno.env`)

&nbsp;

## Usage

```typescript
// MyPropertiesFile.json
{
    "mandarine": {
        "hello-message": "Bonjour!"
    },
    "customKey": "Here goes my custom value"
}
```

```typescript
import { Value } from "https://deno.land/x/mandarinets@v2.2.1/mod.ts";

export class ValueDecoratorTest {

    @Value('customKey')
    public static customKey: string;
    
    @Value('mandarine.hello-message')
    public bonjour: string;

}

console.log(ValueDecoratorTest.customKey); // Here goes my custom value
console.log(new ValueDecoratorTest().bonjour); // Bonjour!
```

&nbsp;

In the example above we can see how we are using `@Value` on top of two different class fields: one that is static, and one that is not. Although, it works for both.
In the example above, we can also see how we are using nested properties with the `@Value` decorator.
