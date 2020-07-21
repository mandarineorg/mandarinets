# `Mandarine.json` File
The `mandarine.json` file allows you to override some behaviors that Mandarine has by default, such as the default location of Mandarine's properties file.

----

## File
A `mandarine.json` file looks like this:
```typescript
    {
        propertiesFilePath: string;
        denoEnv: {
            [prop: string]: string
        }
    }
```

- propertiesFilePath
    - Overrides Mandarine's default properties file location.
- denoEnv
    - Adds environmental variables to `Deno.env`. It essentially works as a [`.env` file](/docs/mandarine/dot-env-file).
