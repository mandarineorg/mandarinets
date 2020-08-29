# Login Builder

------

## Overview
The login builder is a module part of [`WebMVCConfigurer`](/docs/master/mandarine/native-components-list) which is used to create the authentication endpoints for login and logout scenearios. If you are using a login builder, the assumption is that you are using Mandarine **built-in authentication** system and you have created a service to fetch users from a collection ([UserDetailsService]() , [AuthenticationManagerBuilder]());

## `Mandarine.Security.Core.Modules.LoginBuilder` interface
```typescript
export interface LoginBuilder {
    loginProcessingUrl: (url: string) => LoginBuilder;
    loginSuccessUrl: (url: string) => LoginBuilder;
    loginUsernameParameter: (parameter: string) => LoginBuilder;
    loginPasswordParameter: (parameter: string) => LoginBuilder;
    logoutUrl: (url: string) => LoginBuilder;
    logoutSuccessUrl: (url: string) => LoginBuilder;
    handler?: (handler: {
        onSuccess: (request: Request, response: Response, result: AuthenticationResult) => void;
        onFailure: (request: Request, response: Response, result: AuthenticationResult) => void;
    }) => LoginBuilder;
}
```
- `loginProcessingUrl`
    - Endpoint for login where Mandarine built-in authentication will receive login requests.
- `loginSuccessUrl`
    - Page to redirect if login process successes.
- `loginUsernameParameter`
    - Parameter key that represents the username which will be sent during the request.
- `loginPasswordParameter`
    - Paramater key that represents the password which wil be sent during the request
- `logoutUrl`
    - Endpoint for logout where Mandarine built-in authentication will receive logout requests.
- `logoutSuccessUrl`
    - Page to redirect if logout process successes.
- `handler` (Optional)
    - Object with two methods: `onSuccess` & `onFailure`.
    - Type of middleware for both endpoints (login and logout) which gives access to the current request, response, and the result of the Mandarine's authenticator.
        - Method `onSuccess` will be called if endpoint succeded.
        - Method `onFailure` will be called if endpoint failed.
