# Session Middleware
Mandarine contains a Session Container that allows your web-application to make use of the concept of sessions. 

Sessions are states (in variables) that can be distributed across your web-application and they contain information that can be updated at request-time.

Sessions are unique per requester, it is a way to tell your web server who is requesting your endpoints.

-----

## Concepts
- Mandarine Session Cookie
    - A encrypted cookie that is created at request-time. This cookie contains a signature to verify that the it has not been manipulated & contains the session id that will be used to retrieve the information of the session. 
    
## Lifecycle
1) A request is made to an endpoint by someone.
2) Before the request gets to [all custom middleware](/docs/mandarine/custom-middleware) & [HTTP handlers](/docs/mandarine/http-handlers), it is intercepted by the session middleware
3) The session middleware verifies that the request contains a mandarine session cookie
    1) If the request does not contain a mandarine session cookie, then a new cookie is created along with a new session. Otherwise, the mandarine session cookie works as the key for the Mandarine Session Container & the current session is retrieved.
4) After the session is retrieved or created, three variables are injected in the request context (request object)
    1) `request.sessionContext`: Contains all the information about the session.
    2) `request.sessionID`: Contains the key of the session (UUID).
    3) `request.session`: Contains the data that the session holds.
        1) When information is added/removed to this object, the session container receives a signal that the current session context must be updated.
5) After the session variables are injected in the request, the session is ready to be used in the custom middleware and/or the HTTP handlers.
6) After the HTTP handlers & post-request middleware are called, the session is then saved and its context is updated.

## Accessing The Session Object
As described above, the session object is part of the request object when a request is made to an endpoint. The session object is accessible via the use of [HTTP Parameter Decorators](/docs/mandarine/http-handlers), by using the decorator `@Session()` . Please, refer to the link in order to understand this concept.
