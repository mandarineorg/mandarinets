# `.env` File
Mandarine supports a `.env` file. A `.env` file is essentially a properties file which keys & values will be added to environment variables or `Deno.env`. 

Environmental variables are available throughout the application and can be useful to save configurations that will be needed across different objects.

----

## Directions
In order to be able to use a `.env` file with your Mandarine-powered application, your file will **need to be located** under your current working directory (also known as the root of your project).

## File example

```properties
MY_KEY=My value
MY_KEY_NUMBER_2=My value number #2
ANOTHER_KEY="My value 3"
```

&nbsp;

## Lifecycle
This file is resolved at the first stage of Mandarine Compile Time (MCT)
