# Session Container
The session container is a a functionality that provides the creation and manipulation of sessions accross your application. The session container is highly used in Mandarine-powered applications, it is used for the [session middleware](/docs/mandarine/session-middleware) & the [built-in authentication system](/docs/mandarine/auth-introduction).

-----------------

## Overview
By default, Mandarine makes use of a default implementation of the session container, this default implementation stores sessions in memory which may be useful to some extend but for large production applications, we highly recommend to have a different implementation with a more sophisticated system.

## `Mandarine.Security.Sessions.SessionContainer` interface
```typescript
export interface SessionContainer {
    cookie?: Mandarine.Security.Sessions.SessionCookie,
    keys: string[],
    sessionPrefix?: string;
    genId?: Function,
    resave?: boolean,
    rolling?: boolean,
    saveUninitialized?: boolean,
    store?: Mandarine.Security.Sessions.SessionStore
}
```
- `cookie`
    - `cookie.path` Specifies the value for the path of the session cookie. By default, this is set to '/'
    - `cookie.httpOnly` Specifies whether the cookie will be visible in the javascript. By default, this is set to false
    - `cookie.secure` Specifies if the session cookie is secure.
    - `cookie.maxAge` Forces the cookie to expire in the specified amount of time.
- `keys`
    - Specifies an array of keys to sign the cookies related to the sessions.
    - At least one value must be entered. If keys contains multiple values, only the first element will be used to sign, while all the elements will be used to verify the signature.
- `sessionPrefix`
    - Specifies the prefix of the session name for the session cookie. By default, this is set to mandarine-session
- `genId`
    - Specifies the method to be used in order to generate a unique Id. By default, this is set to a mandarine internal method.
- `resave`
    - Forces the session to be saved back in the session store, even when no modifications were made to it. If you want to avoid the use of unnecessary processes, set this to false. By default, this is set to false
- `rolling`
    - Forces the session cookie to reset its expiration time every time there is a request.
- `saveUninitialized`
    - Forces the session to be saved in the session store when it is new and it has not been initialized.
    - A session is new & uninitialized when it has not been modified after its creation.
- `store`
    - Defines the Session Store object. This will be used to process all the sessions. It is an implementation of `MandarineSecurity.Sessions.SessionStore` as described above.

## `Mandarine.Security.Sessions.SessionCookie` interface
```typescript
export interface SessionCookie {
    path?: string,
    httpOnly?: boolean
    secure?: boolean,
    maxAge?: number
}
```

----------------

## `MandarineSecurity.Sessions.SessionStore` interface
For the session container, this is the most important interface. The implementations with this interface will handle the logic behind saving, modifying, and deleting a session.
```typescript
export interface SessionStore {
    options: {
        expirationIntervalHandler: any;
        expirationInterval: number;
        autoclearExpiredSessions: boolean;
        expiration: number; 
    };
    launch(): void;
    get(sessionID: string, callback: (error, result: Mandarine.Security.Sessions.MandarineSession) => void, config?: { touch: boolean }): void;
    getAll(callback: (error, result: Array<Mandarine.Security.Sessions.MandarineSession>) => void): void;
    set(sessionID: string, session: Mandarine.Security.Sessions.MandarineSession, callback: (error, result) => void): void;
    destroy(sessionID: string, callback: (error, result: any) => void): void;
    touch(sessionId: string, callback: (error, result: any) => void): void;
    exist?(sessionID: string): boolean;

    clearExpiredSessions(): void;
    startExpiringSessions(): void;
    stopExpiringSessions(): void;
    stopIntervals(): void;
}
```
- `launch`
    - Activates the intervals for clearing expired sessions.
    - Holds any wanted logic to be executed when Mandarine initializes the session container.
- `get`
    - Gets the session based on a session id, with a callback where result is object that holds the session.
- `getAll`
    - Returns an array of `Mandarine.Security.Sessions.MandarineSession` with all the sessions available
- `set`
    - Sets a session based on a sessionID.
    - Session to be set must be `Mandarine.Security.Sessions.MandarineSession`
- `destroy`
    - Removes a session from the session container
- `touch`
    - Re-calculates the expiration time
- `exist`
    - Verifies whether a session is in the session container
- `clearExpiredSessions`
    - Function to be called by the _"expired sessions interval"_.
    - This function holds the logic behind removing expired sessions.
- `startExpiringSession`
    - Creates and adds a `setInterval` to `options.expirationIntervalHandler`, this interval should have `clearExpiredSessions` as its callback.
- `stopExpiringSessions`
    - Clears the interval for expired sessions
- `stopIntervals`
    - This function should hold the logic behind clearing any interval available in the session store implementation

&nbsp;

You can take a peek at Mandarine's session store implementation by [clicking here](https://raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/mandarine-native/sessions/mandarineDefaultSessionStore.ts)

------------

## `Mandarine.Security.Sessions.MandarineSession` interface
```typescript
    export interface MandarineSession {
        sessionID: string;
        sessionCookie: Cookie;
        sessionData?: object;
        expiresAt?: Date;
        createdAt?: Date;
        isSessionNew?: boolean;
    }
```
- `sessionID`
    - Unique identifier of the session used in the session container.
- `sessionCookie`
    - Cookie related to the current session
- `sessionData`
    - Object with the data the session contains
- `expiresAt`
    - Date when the session expires
- `createdAt`
    - Date when the session was added to the session container
- `isSessionNew`
    - Whether the session has ever been modified or not.