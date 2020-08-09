# Native Components
Native components are instances that Mandarine uses natively, meaning, during & after Mandarine Compile Time (MCT). Native components have several use cases as they establish internal behaviors Mandarine will have such as Resource Handlers or even the session container.

------

## Overriding behavior
Mandarine allows overriding whole or specific sections of a native class. The purpose behind this is to modify those internal behaviors Mandarine establishes as default. In order to override a native component all you need to do is to use the decorator `@Override` on top of your class and the use of `extends` to the native component you want to override (inside `MandarineNative`).  
A good example of what is described above:
```typescript
import { Override, MandarineNative } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

export class WebMvcConfigurer extends MandarineNative.WebMvcConfigurer {
    ....
}
```

<br>

## `@Override` Decorator

**Syntax**:
```typescript
@Override(overrideType?: Mandarine.MandarineCore.NativeComponents)
```
**Target**: Class

- overrideType
    - Used to specify what class we are trying to override. By default, it is undefined, this is because Mandarine will be capable of knowing what component you are trying to override according to the name of your class. If the name of your class is different from Mandarine's pre-defined class names, you will need to manually specify `overrideType`.

## Pre-defined class names

| Class Name | Override Target |
| ---------- | --------------- |
| WebMvcConfigurer | MandarineNative.WebMvcConfigurer |