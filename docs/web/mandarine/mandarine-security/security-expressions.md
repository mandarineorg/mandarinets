# Authentication Security Expressions
Security expressions are boolean expressions that contain methods (or validators). They are passed as an string and then Mandarine's security core is responsible for processing them.

------------

## Usage
Security expressions are available for usage in [`@AllowOnly` decorator](/docs/mandarine/auth-allow-only-decorator).

## Current Built-In Security Expressions
| Expression | Parameters | Description |
| ---------- | ---------- | ----------- |
| `isAuthenticated()` | none | Verify that there is a logged-in user (from Mandarine's built-in authentication system) in the request |
| `hasRole(role)` | role: `String` | Verify that the current logged-in user contains a role |

## Examples
```typescript
import { Controller, AllowOnly, GET } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts";

@Controller()
@AllowOnly("isAuthenticated()")
export class lastcontroller {

    @GET('/security-expressions-2')
    @AllowOnly("hasRole('USER') || hasRole('ADMIN')")
    public handler2() {
        return "You are authenticated and have role USER or ADMIN"
    }
}
```

> At the moment, security expressions are only available under the concept of Mandarine's authentication system and `@AllowOnly` connected to Mandarine's MVC core.