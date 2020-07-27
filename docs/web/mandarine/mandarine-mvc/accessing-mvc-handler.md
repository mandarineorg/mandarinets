# Accessing MVC Handler
The MVC handler is a property that gives you full access to the Oak HTTP Dispatcher handler. This may be useful when deploying your application in providers like Vercel.

----

## API
You can access the MVC handler by invoking the property `handle` part of Mandarine's MVC Core.

```typescript

import { MandarineCore } from "https://x.nest.land/MandarineTS@1.2.2/mod.ts";

... 

let handler = new MandarineCore().MVC().handle;

export default handler;
```