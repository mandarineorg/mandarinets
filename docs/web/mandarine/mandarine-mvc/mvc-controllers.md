# Controllers

> See detailed information [here](docs/mandarine/controller).

Controllers are the only type of component that can handle HTTP requests, which means, they are the only type of components that can handle the creation of routes and interpret the information a route is receiving or sending.

----

## Routes

Routes are endpoints that will be requested by users. Routes can either send to the user or receive information from the user.

Routes are declared through the use of decorators on top of HTTP handlers.

## HTTP Handlers

HTTP handlers are methods that are executed when an endpoint is requested. They are directly connected with the declared routes as route decorators decorate these kind of methods.
