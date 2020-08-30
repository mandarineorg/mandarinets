# Optional

The optional class lets you handle possible null values in a programmatic way, this way, you can avoid the use of multiple if statements in your code. This plugin has been inspired by [Optional](https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html) from Java 8.

------

## Methods

| Method | Description |
| ------ | ----------- |
| of | Creates a new optional from a value
| ofNullable | Creates a new optional from a value, if value is not present or null then it creates an empty instance of Optional.
| ifPresent | Returns a boolean value. True if value is present (not null), otherwise false.
| get | Returns value of Optional.
| orElseGet | Tries to get the value of the Optional instance, if it is not present then it returns a default value passed in the argument of the method
| orElseThrows | Tries to get the value of the Optional instance, if it is not present then it throws a custom error.

## API

```typescript
import { Optional } from "https://deno.land/x/mandarinets@v2.0.0/mod.ts";

let myNullVariable = null;
Optional.of(myNullVariable).ifPresent(); // Returns `false` because value is null.

let organizationName = null;
Optional.of(organizationName).orElseGet("Mandarine.ts Organization"); // Returns `Mandarine.ts Organization` because value is null.

let frameworkName = "React";
Optional.of(frameworkName).orElseGet("Mandarine.ts"); // Returns `React` bacause value **is not** null;

let mySecondNullVariable = null;
Optional.of(mySecondNullVariable).get(); // Throws an error because value is not present/is null.

let companyName = "Amazon Inc.";
Optional.of(companyName).get(); // Returns `Amazon Inc.` because value is present.

let myThirdNullVariable = null;
Optional.of(myThirdNullVariable).orElseThrows(new Error("My custom error")); // Throws `Error: My custom error` because value is null.

let computerName = "Macbook Air";
Optional.of(computerName).orElseThrows(new Error("My custom error")); // Returns `Macbook Air` because value is present/ **not null**.

```

