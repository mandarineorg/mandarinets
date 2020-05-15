import { Cookie } from "https://deno.land/std@v1.0.0-rc1/http/cookie.ts";
export namespace MandarineSecurity {

    export namespace Sessions {

        /**
        * Used in callbacks from Mandarine's native Session storage system. This is not necessary to use.
        *
        */
        export enum MandarineSessionExceptions {
            SESSION_NOT_FOUND = 0
        }

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

        /**
        * This is the class a session will have.
        * When a session is created, a MandarineSession object is being created and it will contain all the available & requested information of this.
        */
        export class MandarineSession implements IMandarineSession {

            public sessionID: string;
            public sessionCookie: Cookie;
            public sessionData: any;
            public isSessionNew?: boolean;
            public expiresAt?: Date;
            public createdAt?: Date;
        
            constructor(sessionId: string, defaultExpiration: number, sessionCookie: Cookie){
                this.sessionID = sessionId;
                this.sessionCookie = sessionCookie;
                this.sessionData = {};
                this.isSessionNew = true;
                this.createdAt = new Date();
        
                if(this.sessionCookie && this.sessionCookie.expires) {
                    this.expiresAt = new Date(this.sessionCookie.expires);
                } else {
                    this.expiresAt = new Date(new Date().getTime() + defaultExpiration);
                }
            }
        }        
    }
}