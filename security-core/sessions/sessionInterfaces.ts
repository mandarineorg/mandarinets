import { Cookie } from "https://deno.land/std@v1.0.0-rc1/http/cookie.ts";

  /**
   * Represents the object of a mandarine session. **This is not customizable**.
   *
   */
export interface IMandarineSession {
    sessionID: string;
    sessionCookie: Cookie;
    sessionData: any;
    expiresAt?: Date;
    createdAt?: Date;
}

  /**
   * Represents how a SessionStore implementation should be designed.
   * SessionStore is used to design & use the process of manipulating sessions
   *
   */
export interface SessionStore {
    options: {
        expirationIntervalHandler: any;
        expirationInterval: number;
        autoclearExpiredSessions: boolean;
        expiration: number; 
    };

    get(sessionID: string, callback: (error, result) => void): void;
    getAll(callback: (error, result) => void): void;
    set(sessionID: string, sessionData: any, callback: (error, result) => void): void;
    destroy(sessionID: string, callback: (error, result) => void): void;
    touch(sessionId: string, callback: (error, result) => void): void;
    exist?(sessionID: string): boolean;

    clearExpiredSessions(): void;
    startExpiringSessions(): void;
    stopExpiringSessions(): void;
}

  /**
   * Represents the object of the configuration for the Session Container
   *
   */
export interface SessionContainer {
    cookie?: {
        path?: string,
        httpOnly?: boolean
        secure?: boolean,
        maxAge?: number
    },
    sessionPrefix?: string;
    genId?: Function,
    resave?: boolean,
    rolling?: boolean,
    saveUninitialized?: boolean,
    store?: SessionStore
}
