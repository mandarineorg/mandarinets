// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Cookie } from "../mvc-framework/core/interfaces/http/cookie.ts";
import { Mandarine } from "../main-core/Mandarine.ns.ts";
import { Request, Response } from "../deps.ts"

/**
 * Contains all the essentials for Mandarine's security core to work
 */
export namespace MandarineSecurity {

    export namespace Crypto {
        export interface PasswordEncoder {
            encode: (rawPassword: string) => string;
            matches: (rawPassword: string, encodedPassword: string) => boolean;
        }
    }

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
        export interface MandarineSession {
            sessionID: string;
            sessionCookie: Cookie;
            sessionData?: object;
            expiresAt?: Date;
            createdAt?: Date;
            isSessionNew?: boolean;
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
            launch(): void;
            get(sessionID: string, callback: (error, result) => void, config?: { touch: boolean }): void;
            getAll(callback: (error, result) => void): void;
            set(sessionID: string, session: MandarineSession, callback: (error, result) => void): void;
            destroy(sessionID: string, callback: (error, result) => void): void;
            touch(sessionId: string, callback: (error, result) => void): void;
            exist?(sessionID: string): boolean;

            clearExpiredSessions(): void;
            startExpiringSessions(): void;
            stopExpiringSessions(): void;
        }

        export interface SessionCookie {
            path?: string,
            httpOnly?: boolean
            secure?: boolean,
            maxAge?: number
        }

        /**
         * Represents the object of the configuration for the Session Container
         *
         */
        export interface SessionContainer {
            cookie?: SessionCookie,
            keys: string[],
            sessionPrefix?: string;
            genId?: Function,
            resave?: boolean,
            rolling?: boolean,
            saveUninitialized?: boolean,
            store?: SessionStore
        }
  
    }

    export namespace Auth {
        export type GrantedAuthority = string;
        
        export interface UserDetails {
            /**
             * Returns an array with the roles the current user has. Cannot return null nor undefined inside the array.
             * Ex: ["ADMIN", "MODERATOR", "USER"]
             */
            roles: Array<GrantedAuthority> | Array<string>;

            /**
             * Returns the password (encrypted) of the current user.
             */
            password: string;

            /**
             * Returns the username of the current user
             */
            username: string;

            /**
             * Returns the id of the current user
             */
            uid: number | string;

            /**
             * Indicates whether the user's account has expired. 
             * An expired account cannot be authenticated.
             */
            accountExpired: boolean;

            /**
             *  Indicates whether the user is locked or unlocked.
             *  A locked user cannot be authenticated.
             */
            accountLocked: boolean;
            /**
             * Indicates whether the user's credentials (password) has expired. 
             * An account with expired credentials cannot be authenticated.
             */
            credentialsExpired: boolean;

            /**
             * Indicates whether the user is enabled or disabled. 
             * A disabled user cannot be authenticated.
             */
            enabled: boolean;
        }

        export interface UserDetailsService {
            /**
             * Locates the user based on the username.
             * 
             * @param username the username identifying the user whose data is required.
             * 
             * @returns A user record with an implementation of UserDetails
             * 
             * @throws MandarineSecurityException if no user was found.
             */
            loadUserByUsername: (username: string) => UserDetails;
        }

        export interface AuthenticationResult {
            status: "FAILED" | "PASSED" | "ALREADY-LOGGED-IN" | "UNKNOWN";
            message?: string;
        }

        export interface AuthenticationManagerBuilder {
            userDetailsService: (implementation: any) => AuthenticationManagerBuilder;
            getUserDetailsService: () => UserDetailsService;
            passwordEncoder: (implementation: Crypto.PasswordEncoder) => AuthenticationManagerBuilder;
            getPasswordEncoder(): Crypto.PasswordEncoder;
        }

        export interface Authenticator {
            verifyAuthenticationSatisfaction: () => boolean;
            isAuthenticated: (requestContext: any) => boolean;
            performAuthentication: (username: string, password: string, requestContext: any) => AuthenticationResult;
            stopAuthentication: (requestContext: any) => void;
        }

        export interface Handler {
            onSuccess: (request: Request, response: Response, result: AuthenticationResult) => void;
            onFailure: (request: Request, response: Response, result: AuthenticationResult) => void;
        }
    }

    export namespace Core {

        export interface LoginConfigurer {
            loginProcessingUrl: string;
            loginSucessUrl: string;
            loginPage: string;
            usernameParameter: string;
            passwordParameter: string;
            logoutUrl: string;
            logoutSuccessUrl: string;
            handler: Auth.Handler;
        }

        export namespace Modules {
            export interface LoginBuilder {
                login: LoginConfigurer;
                loginProcessingUrl: (url: string) => LoginBuilder;
                loginSuccessUrl: (url: string) => LoginBuilder;
                loginPage: (url: string) => LoginBuilder;
                loginUsernameParameter: (parameter: string) => LoginBuilder;
                loginPasswordParameter: (parameter: string) => LoginBuilder;
                logoutUrl: (url: string) => LoginBuilder;
                logoutSuccessUrl: (url: string) => LoginBuilder;
                handler?: (handler: Auth.Handler) => LoginBuilder;
            }
        }

    }

    export function getAuthManagerBuilder(): Auth.AuthenticationManagerBuilder {
        let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface = Mandarine.Global.getMandarineGlobal();
        return mandarineGlobal.__SECURITY__.auth.authManagerBuilder;
    }
}