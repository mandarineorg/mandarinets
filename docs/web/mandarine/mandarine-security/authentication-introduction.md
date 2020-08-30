# Authentication
Mandarine has a built-in system that provides the necessary logic for authentication (login & logout). This authentication system can be combined & customized in different ways, for example, with the right use of Mandarine features such as dependency injection & [repositories](/docs/develop/mandarine/data-repositories), you can connect this system to a database.

-----------

## Overview

- Mandarine's security core provides an authentication framework that directly connects with Mandarine's MVC
- It can be highly customized and extended
- It provides helpers to protect endpoints
- It is compatible with external Javascript & Deno API's. 

## Expiration
By Default, Mandarine establishes a default expiration time of **1 hour**. This expiration time is constantly refreshed as requests are received.  
You may change this expiration time by establishing [your own properties](/docs/mandarine/properties).
```json
{
    "mandarine": {
        "authentication": {
            "expiration": 3600000 // MILLISECONDS
        }
    }
}
```

## Cookies
Mandarine uses a system of cookies under the hood to store the session id that connects the authentication system to the client's computer. You may add a new cookie configuration by overriding it.
```json
{
    "mandarine": {
        "authentication": {
            "cookie": {
                "httpOnly": false
                ....
            }
        }
    }
}
```
Cookies also need a string array to sign the cookie and verify its inmutability, you may put your own keys by overriding the current behavior
```json
{
    "mandarine": {
        "authentication": {
            "security": {
                "cookiesSignKeys": ["MY", "CUSTOM", "KEYS"]
            }        
        }
    }
}
```