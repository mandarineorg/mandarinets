# Mandarine CLI
Mandarine's CLI is a command interface tool used to create Mandarine-powered applications as well as Mandarine-powered modules.

-----

## Installation
```shell script
$ deno install --allow-read --allow-write --allow-run -n mandarine https://deno.land/x/mandarinets/cli.ts
```

-----

## Usage

```shell script
$ mandarine [OPTIONS] [SUBCOMMAND]
```

&nbsp;

**Options**
| Option | Description |
| ------ | ----------- |
| `-h, --help` | Shows the help information of Mandarine's CLI.
| `-v, --version` | Shows the version information of Mandarine's CLI

&nbsp;

**Subcommands**
| Subcommand | Alias | Description |
| ---------- | ----- | ----------- |
| new | n | Creates a Mandarine-powered application (following Mandarine's project structure) in the current working directory.
| generate | g | Generates a Mandarine-powered module.
| run | r | Compiles & Run the mandarine application located in the current working directory.