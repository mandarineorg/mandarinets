# Mandarine's Environmental Variables
With Mandarine's environmental variables you can alter certain behaviors at Deno compile time. This may be useful for deployment services where you may need to follow certain standards.

----

# Variables

- `MANDARINE_JSON_FILE`
    - Location of `mandarine.json` file. Useful when `mandarine.json` cannot be in the root directory.

- `MANDARINE_PROPERTY_FILE`
    - Location of `properties.json` file. Useful when `mandarine.json` is not present or when not wanting to use `mandarine.json` to indicate the location of this file.
