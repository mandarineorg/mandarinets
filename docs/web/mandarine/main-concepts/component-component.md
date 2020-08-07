# Components
Mandarine's _regular components_ are part of Mandarine's stereotype, this means, they do not have any special functionality more than making your class a Mandarine-powered class which will then be available for dependency injection.

Mandarine's stereotypes are also useful for modularity purposes since they allow you to divide your application in different layers.

-----
&nbsp;

## Concepts
- Regular Components are part of Mandarine's Main Core.
- It accepts injection and it is also injectable.

&nbsp;

## Syntax

```typescript
@Component()
```

## Usage

```typescript
import { Component } from "https://x.nest.land/MandarineTS@1.4.0/mod.ts";

@Component()
export class MyComponent {
}
```
