# Response Time Header
Mandarine has a built-in middleware to inject `X-Response-Time` header in the response of a request.

------------

## Concepts
The `X-Response-Time` header is used to measure how long the request took from the time it got in the server to the time the client received a response.
This calculation is just a simple substraction of dates, specifically `Date.now()` which results in the following operation `(Time when the response finished) - (Time when the request got in)`

## Usage
This middleware is under flag, this means, it is disabled by default and it needs to be activated in order to use make use of it.  

In order to use it, you must set the property `responseTimeHeader` in `mandarine.server` to **true** in your [properties file](https://www.mandarinets.org/docs/master/mandarine/custom-properties)

```json
{
    "mandarine": {
        "server": {
            "responseTimeHeader": true
        }
    }
}
```