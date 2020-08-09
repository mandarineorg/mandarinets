// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineSecurity } from "../../security-core/mandarine-security.ns.ts";

export class NativeComponentsOverrideProxy {

    /**
    * Overrides the current session container
    */
    public static changeSessionContainer(newSessionContainer: MandarineSecurity.Sessions.SessionContainer): void {
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
    public static changeResourceHandlers(newResourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry): void {
        if(newResourceHandlerRegistry.getResourceHandlers().length > 0) {
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
            mandarineGlobal.mandarineResourceHandlerRegistry = newResourceHandlerRegistry;
            mandarineGlobal.mandarineResourceHandlerRegistry.overriden = true;
        } 
    }

}