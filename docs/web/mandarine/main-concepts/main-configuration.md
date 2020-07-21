# Typescript Configuration
In order to run a _Mandarine-powered application_, it is necessary to supply a [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file to `deno run`.

If a `tsconfig.json` is not provided, Deno will fail to interpret Mandarine.

```javascript
{
    "compilerOptions": {
        "strict": false,
        "noImplicitAny": false,
        "noImplicitThis": false,
        "alwaysStrict": false,
        "strictNullChecks": false,
        "strictFunctionTypes": true,
        "strictPropertyInitialization": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

> More tsconfig properties are allowed, however, the ones above **are necessary**.

This configuration is passed by using the flag `--config (-c)` during `deno (run | test)`. For more information, [click here](https://deno.land/manual/getting_started/typescript#custom-typescript-compiler-options). 

&nbsp;

# Deno Configuration
Mandarine will always require to use the flags `--allow-net` & `--allow-read`, however, more flags may be required according to the use of different features, for example, if it is wanted to use environment variables then `--allow-env` will be required. [Click here](https://deno.land/manual/getting_started/permissions) for official information about _Deno permissions_.

**Example:**
```shell script
$ deno run --config tsconfig.json --allow-net --allow-read entryPoint.ts
```

