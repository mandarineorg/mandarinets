# Authentication Complete Guide

----------

## Overview
In order to fully use all the features related to Mandarine's built-in authentication, it is necessary to have the following:  
1) A UserDetailsService implementation.  
2) Override login builder (`httpLoginBuilder`) from [WebMVCConfigurer](/docs/master/mandarine/native-components-list).  
3) Override authentication builder (`authManagerBuilder`) from [WebMVCConfigurer](/docs/master/mandarine/native-components-list).  

## Usage
The following example contains a full but simple example on how to use Mandarine's built-in authentication.  

```typescript
@Service()
export class UserDetailsServiceImplementation implements Mandarine.Security.Auth.UserDetailsService {
    public users: Array<Mandarine.Types.UserDetails> = [{
        roles: ["ADMIN"],
        password: "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O", // Changeme1
        username: "testUser",
        uid: 1,
        accountExpired: false,
        accountLocked: false,
        credentialsExpired: false,
        enabled: true
    }]
}
@Override()
export class WebMvcConfigurer extends Mandarine.Native.WebMvcConfigurer {

    public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
        provider = provider.userDetailsService(UserDetailsServiceImplementation);
        return provider;
    }

    public httpLoginBuilder(provider: Mandarine.Security.Core.Modules.LoginBuilder) {
        provider
        .loginProcessingUrl("/login")
        .loginSuccessUrl("/login-success")
        .loginUsernameParameter("username")
        .loginPasswordParameter("password")
        .logoutUrl("/logout")
        .logoutSuccessUrl("/logout-success")
        return provider;
    }
}

@Controller()
export class MyController {
    @GET('/login-success')
    public httpHandler(@AuthPrincipal() myUser: UserDetails) {
        return myUser;
    }
}
```
&nbsp;

Now, if we do the following request:
```http
POST /login HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded

username=testUser&password=Changeme1
```

We will get the following result
```json
{
    "roles": [
        "ADMIN"
    ],
    "password": "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
    "username": "testUser",
    "uid": 1,
    "accountExpired": false,
    "accountLocked": false,
    "credentialsExpired": false,
    "enabled": true
}
```
And this authentication will now be injected in every request (`request.authentication`). [See more here](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.RequestDataContext).

-------------

## Protecting endpoints

With the `@AllowOnly` decorator, you _may_ protect your endpoints at a controller level or a route level. [See more here](/docs/mandarine/auth-allow-only-decorator).