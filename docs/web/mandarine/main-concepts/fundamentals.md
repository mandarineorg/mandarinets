# Fundamentals

Across this documentation & Mandarine's development community, there are some core concepts that may be mentioned repeatedly.

This set of articles will introduce some of the main concepts Mandarine uses which will give you a better understanding of the framework.
 
--------------

## Concepts

- Mandarine Compile Time (MCT)
     - Period of time when Mandarine is initializing its different cores. 
     - During _MCT_, Mandarine is responsible for resolving the application context, dependency injection, entity manager and template registry.
- Mandarine Request Time (MRT)
     - Period of time when _Mandarine MVC_ receives a request and resolves it
- Lifecycle
     - The different stages a framework takes in order to fully initialize
- HTTP Dispatcher
     - Framework to manage incoming HTTP requests.
- Application Context
    - Singleton class which serves as a bridge between Mandarine's cores & your application.
- Dependency Injection (DI)
    - Design pattern where all the objects a class depends on are not managed by the developer but the framework.
- Dependency Injection Container (DI Container)
    - Registry where all dependencies are saved as a singleton and then distributed across the application
- Dependency Injection Factory (DI Factory)
    - Module responsible for connection all the dependencies and resolving them at Mandarine Compile Time (MCT)
- Entity Manager
    - Registry & Bridge for database data.
- Template Registry
    - Registry of all the templates to be used among endpoints.
- MQL
    - Mandarine Query Language
- Proxy Method
    - A proxy method is a hidden processor for one or more of your methods which essentially makes the execution of a method redirect to another method.
