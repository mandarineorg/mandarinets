// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";
import type { MandarineSecurity } from "../../security-core/mandarine-security.ns.ts";

export namespace NativeComponentsOverrideProxy {

    export namespace MVC {
        /**
        * Overrides the current session container
        */
        export function changeSessionContainer(newSessionContainer: MandarineSecurity.Sessions.SessionContainer): void {
            let defaultContainer = Mandarine.Defaults.MandarineDefaultSessionContainer();
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
            
            mandarineGlobal.mandarineSessionContainer = <MandarineSecurity.Sessions.SessionContainer>{
                cookie: {
                    path: (newSessionContainer.cookie && newSessionContainer.cookie.path) ? newSessionContainer.cookie.path : defaultContainer.cookie.path,
                    maxAge: (newSessionContainer.cookie && newSessionContainer.cookie.maxAge) ? newSessionContainer.cookie.maxAge : defaultContainer.cookie.maxAge,
                    httpOnly: (newSessionContainer.cookie && newSessionContainer.cookie.httpOnly) ? newSessionContainer.cookie.httpOnly : defaultContainer.cookie.httpOnly,
                    secure: (newSessionContainer.cookie && newSessionContainer.cookie.secure) ? newSessionContainer.cookie.secure : defaultContainer.cookie.secure
                },
                sessionPrefix: (newSessionContainer.sessionPrefix) ? newSessionContainer.sessionPrefix : defaultContainer.sessionPrefix,
                genId: (newSessionContainer.genId) ? newSessionContainer.genId : defaultContainer.genId,
                resave: (newSessionContainer.resave) ? newSessionContainer.resave : defaultContainer.resave,
                rolling: (newSessionContainer.rolling) ? newSessionContainer.rolling : defaultContainer.rolling,
                saveUninitialized: (newSessionContainer.saveUninitialized) ? newSessionContainer.saveUninitialized : defaultContainer.saveUninitialized,
                store: (newSessionContainer.store) ? newSessionContainer.store : defaultContainer.store,
            };
        }

        /**
        * Overrides resource handlers
        */
        export function changeResourceHandlers(newResourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry): void {
            if(newResourceHandlerRegistry.getResourceHandlers().length > 0) {
                let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
                mandarineGlobal.mandarineResourceHandlerRegistry = newResourceHandlerRegistry;
                mandarineGlobal.mandarineResourceHandlerRegistry.overriden = true;
            } 
        }
    }

    export namespace Security {
        export function changeAuthenticationManager(newAuthenticationManager: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
            mandarineGlobal.__SECURITY__.auth.authManagerBuilder = newAuthenticationManager;
        }

        export function changeHTTPLogingBuilder(newHTTPLogingBuilder: Mandarine.Security.Core.Modules.LoginBuilder) {
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
            mandarineGlobal.__SECURITY__.auth.httpLoginBuilder = newHTTPLogingBuilder;
        }
    }

}