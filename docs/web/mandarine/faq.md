# FAQ
Frequently asked questions

------

## Where can I find legacy documentation?
Legacy documentation can be found [here](https://mandarineframework.gitbook.io/mandarine-ts/)

&nbsp;

## How can I contribute?
See our [contributing guidelines](https://github.com/mandarineorg/mandarinets/blob/master/docs/contributing.md) && our [style guide](https://github.com/mandarineorg/mandarinets/blob/master/docs/style_guide.md)

&nbsp;

## Why do I need a `tsconfig.json`?
Mandarine relies on some typescript configuration properties that are not part of Deno's default values.

&nbsp;

## I am getting a lot of compiling errors
This is probably because your project does not have a proper `tsconfig.json` file. [Click here](https://www.mandarinets.org/docs/master/mandarine/main-configuration#typescript-configuration) to find Mandarine's tsconfig.json.

&nbsp;

## When does Mandarine Compile Time (MCT) start?
Mandarine Compiling process starts at the time your application includes any component from Mandarine's repository. Decorators, Mandarine's native classes & any other mandarine reference invokes Mandarine's compiler.
