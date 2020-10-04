# Installation
To get started, it is important for you to have Deno installed in your computer as Mandarine runs on top Deno. If you already have it installed, you can ignore the next step.

-----------
&nbsp;

# Installing Deno

## Shell (Mac, Linux):
```shell script
$ curl -fsSL https://deno.land/x/install/install.sh | sh
```

## PowerShell (Windows):
```shell script
$ iwr https://deno.land/x/install/install.ps1 -useb | iex
```

For more information and installation options, please [click here](https://deno.land/#installation).

&nbsp;

# Importing Mandarine
Mandarine is available through [deno.land/x](https://deno.land/x/mandarinets) & [nest.land](https://nest.land/package/MandarineTS). We do not recommend importing Mandarine from anywhere else for security concerns.

**deno.land/x**
```ts
import { ... } from "https://deno.land/x/mandarinets@v2.1.1/mod.ts";
```

**nest.land**
```ts
import { ... } from "https://x.nest.land/MandarineTS@2.0.0/mod.ts";
```