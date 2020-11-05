// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { AuthUtils } from "../../../security-core/utils/auth.util.ts";
import { SessionsUtils } from "../../../security-core/utils/sessions.util.ts";
import { MandarineSecurityException } from "../../exceptions/mandarineSecurityException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";
import { HttpUtils } from "../../utils/httpUtils.ts";
import { MandarineAuthenticationException } from "../../exceptions/mandarineAuthException.ts";

/**
 * The authenticator class contains the logic behind executing built-in authentication by Mandarine.
 * This class is requested by Mandarine's built-in authentication
 */
export class Authenticator implements Mandarine.Security.Auth.Authenticator {

    private verifyAuthenticationSatisfaction(withSessionContainer?: boolean): boolean {
        return AuthUtils.verifyAuthenticationSatisfaction(withSessionContainer);
    }

    private isHTTPAuthenticated(requestContext: Mandarine.Types.RequestContext): [boolean, string | undefined] {
        const authCookie = AuthUtils.findAuthCookie(requestContext);
        const sessionContainer = Mandarine.Global.getSessionContainer();
        if(sessionContainer.store && sessionContainer.store.exists) {
            if(authCookie != undefined && sessionContainer.store.exists(authCookie)) {
                return [true, authCookie];
            }
        }

        return [false, undefined];
    }

    /**
     * 
     * @param requestContext Refers to the context of the current request.
     */
    public getAuthenticationId(requestContext: Mandarine.Types.RequestContext): string | undefined {
        return AuthUtils.findAuthCookie(requestContext);
    }

    /**
     * This functions performs authentication using Mandarine built-in auth system. Returns the status of the authentication (Mandarine.Security.Auth.AuthenticationResult) & the object with the user's data if successful.
     * 
     * @param data Contains the information to execute the authentication such as user & password. It takes an optional value for `executer` which is a function to be executed when authentication is done (if successful)
     */
    public performAuthentication(data: Mandarine.Security.Auth.PerformAuthenticationOptions): [Mandarine.Security.Auth.AuthenticationResult, Mandarine.Security.Auth.UserDetails | undefined] {
        const { username, password, executer } = data;
        const throwUserError = () => new MandarineAuthenticationException("User does not exist", Mandarine.Security.Auth.AuthExceptions.INVALID_USER);
        const throwPasswordError = () => new MandarineAuthenticationException("Password is invalid", Mandarine.Security.Auth.AuthExceptions.INVALID_PASSWORD);

        const result: Mandarine.Security.Auth.AuthenticationResult = {
            status: "FAILED"
        };

        try {
            if(!username) throw throwUserError();
            if(!password) throw throwPasswordError();
            if(!this.verifyAuthenticationSatisfaction(false)) throw new MandarineSecurityException(MandarineSecurityException.UNSATISFIED_AUTHENTICATOR);

            const getAuthManagerBuilder = Mandarine.Security.getAuthManagerBuilder();
            const userDetailsLookUpOriginal = getAuthManagerBuilder.getUserDetailsService().loadUserByUsername(username);

            if(!userDetailsLookUpOriginal) {
                throw throwUserError();
            } else {
                const userDetailsLookUp = Object.assign({}, userDetailsLookUpOriginal);
                const userRoles = userDetailsLookUp.roles;

                let passwordMatch = false;
                try {
                    passwordMatch = getAuthManagerBuilder.getPasswordEncoder().matches(password, userDetailsLookUp.password);
                } catch {
                    throw throwPasswordError();
                }

                if(!passwordMatch) {
                    throw throwPasswordError();
                } else if(!userRoles || !Array.isArray(userRoles) || Array.isArray(userRoles) && userRoles.length === 0) {
                    throw new MandarineAuthenticationException("Roles in user are not valid inside Mandarine's context", Mandarine.Security.Auth.AuthExceptions.INVALID_ROLES);
                } else if(userDetailsLookUp.accountExpired) {
                    throw new MandarineAuthenticationException("Account has expired", Mandarine.Security.Auth.AuthExceptions.ACCOUNT_EXPIRED);
                } else if(userDetailsLookUp.accountLocked) {
                    throw new MandarineAuthenticationException("Account is locked", Mandarine.Security.Auth.AuthExceptions.ACCOUNT_LOCKED);
                } else if(userDetailsLookUp.credentialsExpired) {
                    throw new MandarineAuthenticationException("Credentials are expired or are not valid", Mandarine.Security.Auth.AuthExceptions.CREDENTIALS_EXPIRED);
                }else if(!userDetailsLookUp.enabled) {
                    throw new MandarineAuthenticationException("Account is currently disabled", Mandarine.Security.Auth.AuthExceptions.ACCOUNT_DISABLED);
                }

                result.status = "PASSED";
                result.message = "Success";

                if(executer) {
                    executer(result, userDetailsLookUp);
                }

                return [result, userDetailsLookUp];
            }
        } catch(error) {
            result.status = "FAILED";

            if(error instanceof MandarineAuthenticationException) {
                result.exception = error.authException;
            }

            result.message = error.toString();
            return [result, undefined];
        }
    }

    /**
     * 
     * @param data Contains the information to execute the authentication such as user & password. 
     * Optionally, you can pass executers to the executer object. Where `authExecuter` is a function to be called at the end of the authentication if successful & `httpExecuter` a function to be called at the end of the HTTP authentication process.
     */
    public performHTTPAuthentication(data: Mandarine.Security.Auth.PerformHTTPAuthenticationOptions): [Mandarine.Security.Auth.AuthenticationResult, Mandarine.Security.Auth.UserDetails | undefined] {
        const { requestContext, username, password } = data;

        const authenticationData = {
            username,
            password,
            executer: data.executers?.authExecuter
        };

        const [authenticate, userDetails] = this.performAuthentication(authenticationData);

        const authenticationObject = Object.assign({}, authenticate);

        if(authenticationObject.status === "FAILED" || authenticationObject.status === "UNKNOWN" || !userDetails) {
            return [authenticationObject, undefined];
        } else {
            const userDetailsObject = Object.assign({}, userDetails);

            if(!this.verifyAuthenticationSatisfaction()) throw new MandarineSecurityException(MandarineSecurityException.UNSATISFIED_AUTHENTICATOR);

            const [isCurrentlyLoggedIn, sessionID] = this.isHTTPAuthenticated(requestContext);
            if(isCurrentlyLoggedIn) {
                authenticationObject.status = "ALREADY-LOGGED-IN";
                authenticationObject.authSesId = sessionID;
                return [authenticationObject, userDetailsObject];
            }

            const sessionAuthCookie = HttpUtils.createCookie(requestContext, {
                name: MandarineConstants.SECURITY_AUTH_COOKIE_NAME,
                value: `${userDetailsObject.uid}-${userDetailsObject.username}-${CommonUtils.generateUUID()}`,
                expires: new Date(new Date().getTime() + (60 * 60 * 24 * 1000 * 0.5))
            });

            if(!sessionAuthCookie) {
                throw new Error("Error creating auth cookie");
            }

            const mandarineSession = SessionsUtils.sessionBuilder({
                sessionID: sessionAuthCookie,
                sessionCookie: undefined
            }, Mandarine.Global.getMandarineConfiguration().mandarine.authentication.expiration);
            mandarineSession.sessionData = userDetailsObject;

            Mandarine.Global.getSessionContainer().store?.set(sessionAuthCookie, mandarineSession, { override: true });
            
            authenticationObject.authSesId = sessionAuthCookie;  
            
            if(data.executers?.httpExecuter) {
                data.executers?.httpExecuter(authenticationObject, userDetailsObject);
            }

            return [authenticationObject, userDetailsObject];
        }
    }
    
    /**
     * Stops the authentication active on the HTTP request (logs out)
     * 
     * @param requestContext Request context the user has been sent which should theorically contain the data of the authentication.
     */
    public stopHTTPAuthentication(requestContext: Mandarine.Types.RequestContext): void {
        requestContext.cookies.delete(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, {
            signed: true
        });
        Mandarine.Global.getSessionContainer().store?.destroy(requestContext.request?.authentication?.AUTH_SES_ID);
    }

}