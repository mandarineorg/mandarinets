# `@ConfigurationProperties` Decorator
The `@ConfigurationProperties` Decorator allows you to specify what file will be read for the specified class when using [`@Value`](https://www.mandarinets.org/docs/master/mandarine/value-decorator). This is wanted when different configuration files are used instead of the common `mandarine.json`.

-----

## Syntax
```typescript
@ConfigurationProperties(filePath: string)
```

- filePath
    - Path of file to be used for configuration values

&nbsp;

## Usage

```typescript
// amazon.json
{
    "AMAZON_API_KEY": "ABC123921038E203DFG203"
}
```

```typescript
import { Value, ConfigurationProperties } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts";

@ConfigurationProperties('amazon.json')
export class ConfigurationProperties {

    @Value('AMAZON_API_KEY')
    /* It can also be static */
    public customKey: string;

}

console.log(new ConfigurationProperties().customKey); // ABC123921038E203DFG203
```

&nbsp;

In the example above we can see how we are using `@Value` with `@ConfigurationProperties` which is decorating the class itself. By doing this, we can bring values from different configuration files instead of Mandarine's default file.
