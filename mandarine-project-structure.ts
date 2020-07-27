// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

const mandarineDefaultConfig = `{
    "mandarine": {
        "server": {
            "host":"0.0.0.0",
            "port":8080,
            "responseType":"text/html"
        },
        "resources": {
            "staticFolder": "/src/main/resources/static",
            "staticRegExpPattern": "/(.*)"
        },
        "templateEngine": {
            "path":"./src/main/resources/templates",
            "engine":"ejs"
        }
    }
}`;

const mandarineDefaultHelloWorldEndpoint = `import { MandarineCore, Controller, GET } from "https://deno.land/x/mandarinets/mod.ts";

@Controller()
export class MyController {

    @GET('/hello-world')
    public httpHandler() {
        return "Hello world";
    }

}
`;

const mandarineDefaultAppFile = `import { MandarineCore } from "https://deno.land/x/mandarinets/mod.ts";
import { MyController } from "./hello-world/helloWorld.ts";

const controllers = [MyController];
const services = [];
const middleware = [];
const repositories = [];
const configurations = [];
const components = [];
const otherModules = [];

new MandarineCore().MVC().run();
`;

const mandarineDefaultTsConfig = `{
    "compilerOptions": {
        "strict": false,
        "noImplicitAny": false,
        "noImplicitThis": false,
        "alwaysStrict": false,
        "strictNullChecks": false,
        "strictFunctionTypes": true,
        "strictPropertyInitialization": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "allowUmdGlobalAccess": false,
    }
}`;

export const structure = {
    folders: [
        "/test",
        "/src",
        "/src/main",
        "/src/main/mandarine",
        "/src/main/mandarine/hello-world",
        "/src/main/resources",
        "/src/main/resources/templates",
        "/src/main/resources/static",
    ],
    files: {
        "/src/main/resources/properties.json": mandarineDefaultConfig,
        "/src/main/mandarine/app.ts": mandarineDefaultAppFile,
        "/src/main/mandarine/hello-world/helloWorld.ts": mandarineDefaultHelloWorldEndpoint,
        "/tsconfig.json": mandarineDefaultTsConfig
    }
};
