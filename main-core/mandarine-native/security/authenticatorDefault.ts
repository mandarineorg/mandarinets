// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Context } from "../../../deps.ts";
import { AuthUtils } from "../../../security-core/utils/auth.util.ts";
import { SessionsUtils } from "../../../security-core/utils/sessions.util.ts";
import { MandarineSecurityException } from "../../exceptions/mandarineSecurityException.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MandarineConstants } from "../../mandarineConstants.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";
import { HttpUtils } from "../../utils/httpUtils.ts";

export class Authenticator implements Mandarine.Security.Auth.Authenticator {

    public verifyAuthenticationSatisfaction(): boolean {
        return AuthUtils.verifyAuthenticationSatisfaction();
    }

    public isAuthenticated(requestContext: Context) {
        const authCookie = AuthUtils.findAuthCookie(requestContext);
        if(authCookie != undefined && Mandarine.Global.getSessionContainer().store.exist(authCookie)) {
            return true;
        }

        return false;
    }

    public performAuthentication(username: string, password: string, requestContext: Context) {

        const result: Mandarine.Security.Auth.AuthenticationResult = {
            status: "FAILED"
        };

        if(this.isAuthenticated(requestContext)) {
            result.status = "ALREADY-LOGGED-IN";
            return result;
        }

        if(!username) {
            result.message = "Username is undefined"
            return result;
        }

        try {
            if(!this.verifyAuthenticationSatisfaction()) throw new MandarineSecurityException(MandarineSecurityException.UNSATISFIED_AUTHENTICATOR);
            const getAuthManagerBuilder = Mandarine.Security.getAuthManagerBuilder();
            const userDetailsLookUp = getAuthManagerBuilder.getUserDetailsService().loadUserByUsername(username);
            const userRoles = userDetailsLookUp.roles;

            if(!getAuthManagerBuilder.getPasswordEncoder().matches(password, userDetailsLookUp.password)) {
                result.message = "Password is invalid";
                return result;
            } else if(!userRoles || !Array.isArray(userRoles) || Array.isArray(userRoles) && userRoles.length === 0) {
                result.message = "Roles in user are not valid inside Mandarine's context";
                return result;
            } else if(userDetailsLookUp.accountExpired) {
                result.message = "Account has expired";
                return result;
            } else if(userDetailsLookUp.accountLocked) {
                result.message = "Account is locked";
                return result;
            } else if(userDetailsLookUp.credentialsExpired) {
                result.message = "Credentials are expired or are not valid";
                return result;
            }else if(!userDetailsLookUp.enabled) {
                result.message = "Account is currently disabled";
                return result;
            }

            result.status = "PASSED";

            const sessionAuthCookie = HttpUtils.createCookie(requestContext, {
                name: MandarineConstants.SECURITY_AUTH_COOKIE_NAME,
                value: `${userDetailsLookUp.uid}-${userDetailsLookUp.username}-${CommonUtils.generateUUID()}`,
                expires: new Date(new Date().getTime() + (60 * 60 * 24 * 1000 * 0.5))
            });

            if(!sessionAuthCookie) {
                result.status = "FAILED";
                result.message = "Error creating auth cookie"
                return result;
            }

            let mandarineSession = SessionsUtils.sessionBuilder({
                sessionID: sessionAuthCookie,
                sessionCookie: undefined
            }, Mandarine.Global.getMandarineConfiguration().mandarine.authentication.expiration);
            mandarineSession.sessionData = userDetailsLookUp;

            Mandarine.Global.getSessionContainer().store.set(sessionAuthCookie, mandarineSession, (error, result) => {});

            result.message = "Success";
            return result;

        } catch(error) {
            result.status = "FAILED";
            result.message = error.toString();

            return result;
        }
    }
    
    public stopAuthentication(requestContext: Context) {
        requestContext.cookies.delete(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, {
            signed: true
        });
        Mandarine.Global.getSessionContainer().store.destroy((requestContext.request as any)?.authentication?.AUTH_SES_ID, (error, result) => {
        });
    }

}