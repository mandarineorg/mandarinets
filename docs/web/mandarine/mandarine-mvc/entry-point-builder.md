# Application Builder
Mandarine allows you to create an entry point with its application builder. The application builder has many advantages, one of it being having cleaner code in your entry point file.

-------------------

## Usage

**Case #1**    
By using `automaticBuildAndRun`, Mandarine will handle running and configuring your application automatically, including the different imports of the different components you have created. These components **must be** available for exports & imports.

> Note: Mandarine will create a folder called `.mandarine_target` where the auto-generated entry point will be located.

```typescript
import { AppBuilder } from "https://deno.land/x/mandarinets@v2.2.0/appBuilder.ts";

new AppBuilder().automaticBuildAndRun({
    tsconfigPath: "./tsconfig.json",
    flags: ["--allow-all", "--unstable"],
    reload: false
});
```

-------------

**Case #2**   
By using `buildMVC`, you must supply the components that Mandarine will be working with (this includes your controllers, services, middleware, and any other Mandarine-powered component you have created).

```typescript
import { AppBuilder } from "https://deno.land/x/mandarinets@v2.2.0/appBuilder.ts";
import { MyController, MyService } from "imports.ts";

new AppBuilder().setHost("127.0.0.1").setPort(1099).buildMVC([MyController, MyService]).run();

```

------------

## Builder Methods

| Method | Description |
| ------ | ----------- | 
| `setHost` | Sets the host IP where Mandarine MVC will run |
| `setPort` | Sets the port where Mandarine MVC will run |
| `enableResponseTimeHeader` | Enables `X-Response-Time` <br> Optionally, you could supply a boolean value to enable/disable |
| `enableSessions` | Enables [the session middleware](https://www.mandarinets.org/docs/master/mandarine/session-middleware) <br> Optionally, you could supply a boolean value to enable/disable |
| `setStaticContentFolder` | Sets the directory path for serving static content |
| `setAuthExpirationTime` | Sets the amount of time an authentication session should take in order to be expired |
| `buildCore` | Takes an array of classes (Mandarine-powered components) to be built in the core & builds the core |
| `buildMVC` | Takes an array of classes (Mandarine-powered components), builds the core & the MVC engine |
| `automaticBuildAndRun` | Automatically detects Mandarine-powered components, generates an entry-point file & runs the application |