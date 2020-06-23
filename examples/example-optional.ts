import { Optional } from "https://deno.land/x/mandarinets/pluggins/optional.ts";

let myNullVariable = null;
Optional.of(myNullVariable).ifPresent(); // Returns `false` because value is null.

let organizationName = null;
Optional.of(organizationName).orElseGet("Mandarine.ts Organization"); // Returns `Mandarine.ts Organization` because value is null.

let frameworkName = "React";
Optional.of(frameworkName).orElseGet("Mandarine.ts"); // Returns `React` bacause value **is not** null;

let mySecondNullVariable = null;
Optional.of(mySecondNullVariable).get(); // Throws an error because value is not present/is null.

let myThirdNullVariable = null;
Optional.of(myThirdNullVariable).orElseThrows(new Error("My custom error")); // Throws `Error: My custom error` because value is null.

let computerName = "Macbook Air";
Optional.of(computerName).orElseThrows(new Error("My custom error")); // Returns `Macbook Air` because value is present/ **not null**.
