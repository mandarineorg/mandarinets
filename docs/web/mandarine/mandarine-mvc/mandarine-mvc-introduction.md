# Mandarine MVC

Mandarine MVC is part of the 4 cores inside the framework. Mandarine MVC specifically serves to everything related to a Mandarine-powered HTTP server.

-----

## Lifecycle
Information & Diagram about Mandarine's lifecycle is found [here](/docs/mandarine/lifecycle).

-----

## Oak
Under the hood, Mandarine makes use of [Oak](https://github.com/oakserver/oak), an HTTP dispatcher for Deno.

-----

## Must-know features
- Routing Automation
    - Both routes & controllers are declared through the use of Decorators, making your application standardized & readable.
- Template Engine
    - Support [EJS](https://ejs.co/)
    - Support [Handlerbars](https://handlebarsjs.com/)
- Sessions
    - Built-in session engine that allows you to interact with sessions (states) across your web application. Sessions are unique for every requester.
- Middleware
    - MVC allows you to create HTTP interceptors (Middleware) for specific routes (or pattern of routes).
    - Middleware are available to use pre & post request.
    
-----

## Server Data
- By default Mandarine MVC runs on port **8080**
- By default Mandarine MVC listens to **0.0.0.0**

[See here](http://localhost:4200/docs/mandarine/properties) to change these values.
