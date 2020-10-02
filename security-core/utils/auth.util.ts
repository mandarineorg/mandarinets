// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../main-core/mandarineConstants.ts";

export class AuthUtils {
    public static findAuthCookie(context: Mandarine.Types.RequestContext) {
        return context.cookies.get(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, { signed: true });
    }

    public static verifyAuthenticationSatisfaction(): boolean {
        const getAuthManagerBuilder = Mandarine.Security.getAuthManagerBuilder();
        return (getAuthManagerBuilder.passwordEncoder != undefined 
                && getAuthManagerBuilder.userDetailsService != undefined
                    && Mandarine.Global.getSessionContainer().store != undefined);
    }

    public static verifyHTTPLogingConfigurerSatisfaction(loginConfigurer: Mandarine.Security.Core.LoginConfigurer): boolean {
        return (loginConfigurer.loginSucessUrl != undefined
                    && loginConfigurer.loginProcessingUrl != undefined
                        && loginConfigurer.logoutSuccessUrl != undefined
                            && loginConfigurer.logoutUrl != undefined
                                && loginConfigurer.passwordParameter != undefined
                                    && loginConfigurer.usernameParameter != undefined);
    }
}