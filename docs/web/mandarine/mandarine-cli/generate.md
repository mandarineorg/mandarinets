# `mandarine generate`
Generates a Mandarine-powered module.

-----

**Syntax:**

```shell script
$ mandarine generate [MODULE NAME] [TYPES]
```

**Arguments:**
| Argument | Description |
| -------- | ----------- |
| [Module name] | Name of the module to create

&nbsp;

**Types:**
| Type | Description |
| ---- | ----------- |
| --controller (-c) | Adds a Controller component to the module.
| --service (-s) | Adds a Service component to the module.
| --component | Adds a regular mandarine-powered component to the module.
| --middleware (-m) | Adds a middleware component to the module.
| --repository (-r) | Adds a repository component to the module.
| --model | Adds a mandarine-powered database model to the module.
| --configuration | Adds a configuration component to the module.