# Properties
Mandarine.TS contains a property structure that allows the developer to modify some of the default behaviors of the framework as well as letting the developer create & configure their own properties to be used across the application.

----

## File

```typescript
{
        [prop: string]: any,
        mandarine: {
            server: {
                host?: string,
                port: number,
                responseType?: MandarineMVC.MediaTypes
            } & any,
            resources: {
                staticRegExpPattern?: string,
                staticFolder?: string,
                staticIndex?: string,
                cors?: MandarineMVC.CorsMiddlewareOption
            } & any,
            templateEngine: {
                engine: Mandarine.MandarineMVC.TemplateEngine.Engines,
                path: string
            } & any,
            dataSource?: {
                dialect: Mandarine.ORM.Dialect.Dialects,
                data: {
                    host: string,
                    port?: number,
                    username: string,
                    password: string,
                    database: string,
                    poolSize?: number
                } & any
            } & any,
            authentication?: {
                expiration?: number,
                cookie?: CookieConfig
            } & any,
            security?: {
                cookiesSignKeys: Array<string>
            } & any,
        } & any
}
```

## Default values

```typescript

{
    mandarine: {
        server: {
            host: "0.0.0.0",
            port: 8080,
            responseType: Mandarine.MandarineMVC.MediaTypes.TEXT_HTML
        },
        resources: {
            staticFolder: "./src/main/resources/static",
            staticRegExpPattern: "/(.*)"
        },
        templateEngine: {
            path: "./src/main/resources/templates",
            engine: "ejs"
        },
        authentication: {
            expiration: (1 * 3600 * 1000), // ONE HOUR
                cookie: {
                    httpOnly: false
                }
            },
            security: {
                cookiesSignKeys: ["HORSE", "MANDARINE", "CAT", "NORWAY", "ORANGE", "TIGER"]
            }        
        }
}
```

## Environmental Variables
In order to use values from environmental variables, you may reference them using the following pattern: `${VAR}`.  
Example:
```
{
    "mandarine": {
        "server": {
            "host": "${ENV_PORT}"
        }
    }
}
```