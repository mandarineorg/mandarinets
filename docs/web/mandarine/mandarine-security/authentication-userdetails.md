# User Details

---------

## Overview
Under the hood, Mandarine makes use of `Mandarine.Types.UserDetails` interface. This interface contains the minimum of fields that Mandarine's authenticator needs in order to perform the authentication process. You can, of course, create your own implementation of `Mandarine.Types.UserDetails` by extending it which means: you may add new fields but you must keep the fields the initial interface provides.

## `Mandarine.Types.UserDetails` interface  


- roles: `Array<GrantedAuthority> | Array<string>`
    - An array of string values that contains the roles present in the user, for example: `["ADMIN", "USER"]`.
    - If **roles** is undefined, authentication will fail. At least one value must be present.
- username: `String`
    - Username of the present user.
    - If undefined or null or absent, authentication will fail.
- password: `String`
    - Encrypted password (based on authentication's password encoder).
    - Used to compare incoming password against user's real password.
- uid: `String | number`
    - Unique identifier of the user.
- accountExpired: `Boolean`
    - Indicates whether the user's account has expired.
    - An expired account cannot be authenticated.
- accountLocked: `Boolean`
    - Indicates whether the user is locked or unlocked.
    - A locked user cannot be authenticated.
- credentialsExpired: `Boolean`
    - Indicates whether the user's credentials (password) has expired.
    - An account with expired credentials cannot be authenticated.
- enabled: `Boolean`
    - Indicates whether the user is enabled or disabled. 
    - A disabled user cannot be authenticated.