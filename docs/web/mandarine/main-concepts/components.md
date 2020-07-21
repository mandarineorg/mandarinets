# Components

----

Mandarine makes use of the concept of **Components**. A component refers to a module of a Mandarine-powered application.

There are different types of components, some perform specific tasks while others are used for stereotyping your application, this essentially means: giving your application a straightforward division thus incrementing readability and sustainability.

In Mandarine, everything that is desired to be _Mandarine-powered_ must be a component in order to be compatible with the different cores & features of the framework such as Dependency Injection.

## Component Types

- Controller
    - Responsible for handling the creation of endpoints as well as the bridge with Mandarine's HTTP Dispatcher.
- Middleware
    - Responsible for handling interceptors before & after a request made to an endpoint. 
    - Useful for things such as validations.
- Repository
    - Bridge between Mandarine's entity manager, your database and your application. 
    - Mandarine's repositories are highly dependent on MQL (Mandarine Query Language).
- Component
    - Stereotype for a Mandarine-powered class
- Service
    - Stereotype for a Mandarine-powered class which will be used in the Application's service layer.
- Configuration
    - Stereotype for a Mandarine-powered class to interact directly with Mandarine's core.
- **Manual Component**
    - Serves as the bridge to bring non Mandarine-powered code into Mandarine's ecosystem.
    - Useful when wanting to adapt third-party libraries with Mandarine's infrastructure.

