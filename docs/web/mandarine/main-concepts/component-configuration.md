# Configuration
Mandarine's _Configuration components_ are part of Mandarine's stereotype, this means, they do not have any special functionality more than making your class a Mandarine-powered class which will then be available for dependency injection.

Mandarine's stereotypes are also useful for modularity purposes since they allow you to divide your application in different layers.

-----

> Configuration components are recommended when dealing with Mandarine's internal core.

-----
&nbsp;

## Concepts
- Configuration components are part of Mandarine's Main Core.
- It accepts injection and it is also injectable.

&nbsp;

## Syntax

```typescript
@Configuration()
```

## Usage

```typescript
import { Configuration } from "https://deno.land/x/mandarinets@v2.1.1/mod.ts";

@Configuration()
export class MyConfiguration {
}
```
