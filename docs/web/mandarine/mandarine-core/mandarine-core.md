# Mandarine Core
The core initialization is responsible for unifying all mandarine modules (Core, MVC, Security, Data) into one as it handles some of the most important tasks inside the framework.

----


## Invoking Mandarine's core
In order to invoke the initialization of Mandarine's core, follow the example:
```typescript
import { MandarineCore } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

/**
 * Code
 * Or Single entry-point File
 */
 
 new MandarineCore();
```

## MVC Bridge
The MVC bridge is the process of using Mandarine's MVC Core. This process is done through Mandarine's core.
```typescript
import { MandarineCore } from "https://x.nest.land/MandarineTS@1.5.0/mod.ts";

/**
 * Code
 * Or Single entry-point File
 */
 
 new MandarineCore().MVC();
```

If you would like to run your Mandarine-powered MVC application, you would use the method `run` as following

```typescript
new MandarineCore().MVC().run();
```
