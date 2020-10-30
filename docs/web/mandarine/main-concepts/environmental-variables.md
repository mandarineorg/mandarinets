# Mandarine's Environmental Variables
With Mandarine's environmental variables you can alter certain behaviors at Deno compile time. This may be useful for deployment services where you may need to follow certain standards.

----

# Variables

- `MANDARINE_JSON_FILE`
    - Location of `mandarine.json` file. Useful when `mandarine.json` cannot be in the root directory.

- `MANDARINE_PROPERTY_FILE`
    - Location of `properties.json` file. Useful when `mandarine.json` is not present or when not wanting to use `mandarine.json` to indicate the location of this file.

- `MANDARINE_SERVER_HOST`: string
    - Specifies the host ip where Mandarine MVC should run.

- `MANDARINE_SERVER_PORT`: number
    - Specifies the port where Mandarine MVC should run.

- `MANDARINE_SERVER_RESPONSE_TIME_HEADER`: boolean
    - Specifies whether the `X-Response-Time` header should be enabled by default or not.

- `MANDARINE_SERVER_SESSION_MIDDLEWARE`: boolean
    - Specifies whether the session middleware should be enabled by default or not.

- `MANDARINE_STATIC_CONTENT_FOLDER`: string
    - Specifies the path of the folder where static content will be served if any.

- `MANDARINE_AUTH_EXPIRATION_MS`: number
    - Amount of time an authentication session should take in order to expire (in milliseconds)