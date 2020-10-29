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

    public verifyAuthenticationSatisfaction(): boolean {
        return AuthUtils.verifyAuthenticationSatisfaction();
    }

    public isAuthenticated(requestContext: Mandarine.Types.RequestContext): boolean {
        const authCookie = AuthUtils.findAuthCookie(requestContext);
        const sessionContainer = Mandarine.Global.getSessionContainer();
        if(sessionContainer.store && sessionContainer.store.exists) {
            if(authCookie != undefined && sessionContainer.store.exists(authCookie)) {
                return true;
            }
        }

        return false;
    }

    public performAuthentication(username: string, password: string, requestContext: Mandarine.Types.RequestContext): Mandarine.Security.Auth.AuthenticationResult {
        
        const throwUserError = () => new MandarineAuthenticationException("User does not exist", Mandarine.Security.Auth.AuthExceptions.INVALID_USER);
        const throwPasswordError = () => new MandarineAuthenticationException("Password is invalid", Mandarine.Security.Auth.AuthExceptions.INVALID_PASSWORD);

        const result: Mandarine.Security.Auth.AuthenticationResult = {
            status: "FAILED"
        };

        if(this.isAuthenticated(requestContext)) {
            result.status = "ALREADY-LOGGED-IN";
            result.authSesId = AuthUtils.findAuthCookie(requestContext);
            return result;
        }
        
        if(!username) {
            throw throwUserError();
        }

        try {
            if(!this.verifyAuthenticationSatisfaction()) throw new MandarineSecurityException(MandarineSecurityException.UNSATISFIED_AUTHENTICATOR);
            const getAuthManagerBuilder = Mandarine.Security.getAuthManagerBuilder();
            const userDetailsLookUp = getAuthManagerBuilder.getUserDetailsService().loadUserByUsername(username);
            if(!userDetailsLookUp) {
                throw throwUserError();
            } else {
                const userRoles = userDetailsLookUp.roles;

                let passwordMatch;
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

                const sessionAuthCookie = HttpUtils.createCookie(requestContext, {
                    name: MandarineConstants.SECURITY_AUTH_COOKIE_NAME,
                    value: `${userDetailsLookUp.uid}-${userDetailsLookUp.username}-${CommonUtils.generateUUID()}`,
                    expires: new Date(new Date().getTime() + (60 * 60 * 24 * 1000 * 0.5))
                });

                if(!sessionAuthCookie) {
                    throw new Error("Error creating auth cookie");
                }

                let mandarineSession = SessionsUtils.sessionBuilder({
                    sessionID: sessionAuthCookie,
                    sessionCookie: undefined
                }, Mandarine.Global.getMandarineConfiguration().mandarine.authentication.expiration);
                mandarineSession.sessionData = userDetailsLookUp;

                Mandarine.Global.getSessionContainer().store?.set(sessionAuthCookie, mandarineSession, { override: true });
                
                result.authSesId = sessionAuthCookie;
                result.message = "Success";
                return result;
            }
        } catch(error) {
            result.status = "FAILED";

            if(error instanceof MandarineAuthenticationException) {
                result.exception = error.authException;
            }

            result.message = error.toString();
            return result;
        }
    }
    
    public stopAuthentication(requestContext: Mandarine.Types.RequestContext): void {
        requestContext.cookies.delete(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, {
            signed: true
        });
        Mandarine.Global.getSessionContainer().store?.destroy(requestContext.request?.authentication?.AUTH_SES_ID);
    }

}