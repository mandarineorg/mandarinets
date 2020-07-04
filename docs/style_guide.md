# MandarineTS Style Guide
## Table of contents
## Copyright Headers
Every file related to the functionality of Mandarine must have the following copyright header
```
// Copyright 2020 the MandarineTS Framework authors. All rights reserved. MIT license.
```
If the code originates elsewhere such as a third-party module or piece of code, ensure that the file has proper copyright headers. We only allow **MIT** licensed code.
## Use Camel case
Example: **Use** `myFile.ts` instead of `my-file.ts` or `my_file.ts`.
## Use dashes for folders
Example: **Use** `my-folder` instead of `my_folder` or `myFolder`
## Add tests for new features
For testing, use [Orange testing framework](https://github.com/mandarineorg/orange).  
Each module should contain tests that verify all the functionalities are properly working. If a module is missing its testing files, it will be rejected.
## TODO comments
TODO comments should usually include an issue or the author's github username in parentheses. Example:
```
// TODO(andreespirela): Add tests.
// TODO(#123): Support Windows.
// FIXME(#349): Sometimes panics.
```
## Follow the coding standards
Make sure your files are located in their proper folders, example: a file related to the MVC core **must not** be inside the main core folder.
## Be aware of the amount of LOC
- Do not ever extra code something, if you are writing an utility function, make sure it exists inside Mandarine or `deno/std`.
- Functionalities of module like _Decorators_ must be written in a proxy to be able to test it.
# Typescript
## Interfaces & Enums
Interfaces & Enums must be located under their core namespace. If you are writing an interface related to the `main-core` module, then it should be located inside `Mandarine.ns.ts`
