// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { LoginHandler } from "./loginHandler.ts";

export class HTTPLoginBuilder implements Mandarine.Security.Core.Modules.LoginBuilder {
    public login: Mandarine.Security.Core.LoginConfigurer = {
        loginProcessingUrl: undefined,
        loginSucessUrl: undefined,
        usernameParameter: undefined,
        passwordParameter: undefined,
        logoutUrl: undefined,
        logoutSuccessUrl: undefined,
        handler: new LoginHandler()
    }; 

    public loginProcessingUrl(url: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.loginProcessingUrl = url;
        return this;
    }

    public loginSuccessUrl(url: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.loginSucessUrl = url;
        return this;
    }

    public loginUsernameParameter(parameter: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.usernameParameter = parameter;
        return this;
    }

    public loginPasswordParameter(parameter: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.passwordParameter = parameter;
        return this;
    }

    public logoutUrl(url: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.logoutUrl = url;
        return this;
    }

    public logoutSuccessUrl(url: string): Mandarine.Security.Core.Modules.LoginBuilder {
        this.login.logoutSuccessUrl = url;
        return this;
    }

    public handler(handler: Mandarine.Security.Auth.Handler) {
        this.login.handler = handler;
        return this;
    }
}