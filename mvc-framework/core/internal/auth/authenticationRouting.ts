// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Router, Context } from "../../../../deps.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { AuthUtils } from "../../../../security-core/utils/auth.util.ts";
import { Log } from "../../../../logger/log.ts";
import { Authenticator } from "../../../../main-core/mandarine-native/security/authenticatorDefault.ts";
import { HttpUtils } from "../../../../main-core/utils/httpUtils.ts";
import { MandarineSecurityException } from "../../../../main-core/exceptions/mandarineSecurityException.ts";

export class AuthenticationRouting {

    public static logger: Log = Log.getLogger(AuthenticationRouting);
    public static authenticator: Authenticator = new Authenticator();

    public initialize(router: Router): Router {
        const httpLogingConfigurer = Mandarine.Global.getMandarineGlobal().__SECURITY__.auth.httpLoginBuilder;
        if(!this.verifySatisfaction(httpLogingConfigurer)) {
            return router;
        }

        router = this.createAuthLoginRoute(router);
        router = this.createAuthLogoutRoute(router);
        return router;
    }

    public verifySatisfaction(httpLoginConfigurer: Mandarine.Security.Core.Modules.LoginBuilder): boolean {
        if(!AuthUtils.verifyAuthenticationSatisfaction || !AuthUtils.verifyHTTPLogingConfigurerSatisfaction(httpLoginConfigurer.login)) {
            AuthenticationRouting.logger.warn("Authentication Manager was not found or could not be satisfied");
            return false;
        }
        return true;
    }

    public createAuthLoginRoute(router: Router): Router {
        const httpLogingConfigurer = Mandarine.Global.getMandarineGlobal().__SECURITY__.auth.httpLoginBuilder;

        const processor = async (context: any, next: Function) => {
            const typedContext: Mandarine.Types.RequestContext = context;
            const contentType = typedContext.request.serverRequest.headers.get("content-type");
            let body = undefined;
            if(contentType === "application/json" || contentType === "application/x-www-form-urlencoded") body = await HttpUtils.parseBody(typedContext.request);
            if(!body) throw new MandarineSecurityException(MandarineSecurityException.INVALID_LOGIN_DATA);

            const [ authentication ] = AuthenticationRouting.authenticator.performHTTPAuthentication({
                username: body[(httpLogingConfigurer.login.usernameParameter || "username")], 
                password: body[(httpLogingConfigurer.login.passwordParameter || "password")],
                requestContext: typedContext
            });

            const shouldRedirect = () => {
                const loginSuccessUrl = httpLogingConfigurer.login.loginSucessUrl;
                if(loginSuccessUrl) {
                    typedContext.response.redirect(loginSuccessUrl);
                }
            }
            
            if (authentication.status === "FAILED") {
                typedContext.response.status = 401;
                httpLogingConfigurer.login.handler.onFailure(typedContext.request, typedContext.response, authentication);
            } else if(authentication.status === "PASSED") {
                typedContext.response.status = 200;
                httpLogingConfigurer.login.handler.onSuccess(typedContext.request, typedContext.response, authentication);
                shouldRedirect();
            } else if(authentication.status === "ALREADY-LOGGED-IN") {
                typedContext.response.status = 200;
                shouldRedirect();
            }

            await next();
        }

        router.post(<string> httpLogingConfigurer.login.loginProcessingUrl, processor);

        return router;
    }

    public createAuthLogoutRoute(router: Router): Router {
        const httpLogingConfigurer = Mandarine.Global.getMandarineGlobal().__SECURITY__.auth.httpLoginBuilder;

        const processor = async (context: any, next: Function) => {
            const typedContext: Mandarine.Types.RequestContext = context;
            AuthenticationRouting.authenticator.stopHTTPAuthentication(typedContext);
            typedContext.response.status = 200;
            const logoutSuccessUrl = httpLogingConfigurer.login.logoutSuccessUrl;
            if(logoutSuccessUrl) {
                typedContext.response.redirect(logoutSuccessUrl);
            } else {
                typedContext.response.body = {
                    status: "LOGOUT",
                    message: "ok"
                }
            }
            await next();
        }

        router.get(<string> httpLogingConfigurer.login.logoutUrl, processor);

        return router;
    }

}