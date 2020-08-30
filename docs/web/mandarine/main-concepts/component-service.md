# Components
Mandarine's _Service components_ are part of Mandarine's stereotype, this means, they do not have any special functionality more than making your class a Mandarine-powered class which will then be available for dependency injection.

Mandarine's stereotypes are also useful for modularity purposes since they allow you to divide your application in different layers.

-----
&nbsp;

## Concepts
- Services are part of Mandarine's Main Core.
- It accepts injection and it is also injectable.

&nbsp;

## Syntax

```typescript
@Service()
```

## Usage

```typescript
import { Service } from "https://deno.land/x/mandarinets@v2.0.0/mod.ts";

@Service()
export class MyService {
}
```
