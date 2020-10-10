# Entry Point
The entry point file is a file that contains the references for the different modules of your application. 

-----------

## Overview
The single entry point file serves as an index for all your Mandarine-powered components as well as modules that are not written in Mandarine but are required in certain sections of your Mandarine-powered application.

## Usage
```typescript
import { MandarineCore } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";

const services = [/* References */];
const controllers = [/* References */];
const middleware = [/* References */];
const repositories = [/* References */];
const configurations = [/* References */];
const components = [/* References */];
const otherModules = [/* References */];

new MandarineCore().MVC().run();
```
In the above example, we can see how we have different arrays where we will reference our modules. These arrays have no effect on the code whatsoever, their only purpose is to bring together all your modules into a single file in order for Deno to pick these and make everything work out as a whole.

&nbsp;

A good real example would look as follows:
```typescript
import { MandarineCore } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";
import { Controller1, Controller2, Controller3 } from "./controllers-exports.ts";

const services = [/* References */];
const controllers = [Controller1, Controller2, Controller3];
const middleware = [/* References */];
const repositories = [/* References */];
const configurations = [/* References */];
const components = [/* References */];
const otherModules = [/* References */];
```
There is no need to initialize these classes, you **must** only reference them (type referencing) as shown above.