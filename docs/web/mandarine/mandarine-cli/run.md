# `mandarine run`
Compiles & Run the mandarine application located in the current working directory.

-----

**Syntax:**

```shell script
$ mandarine run [OPTIONS]
```

&nbsp;

**Options**

| Option | Description | Required |
| ------ | ----------- | -------- |
| --entry-point | Defines where Mandarine's entry point file is located.<br> Default: `[DENO_CWD]/src/main/mandarine/app.ts` | No
| --tsconfig | Specifies the route of tsconfig.json to be used. <br> Default: [DENO_CWD]/tsconfig.json | No
| --allow-write | Specifies deno should use the flag --allow-write | No
| --allow-read | Specifies deno should use the flag --allow-read | No
| --allow-run | Specifies deno should use the flag --allow-run | No
| --allow-env | Specifies deno should use the flag --allow-env | No
| --allow-all | Specifies deno should use the flag --allow-all | No
| --reload | Specifies deno should use the flag --reload | No