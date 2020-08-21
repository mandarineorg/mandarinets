// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Context } from "../../../deps.ts";
import { AuthUtils } from "../../../security-core/utils/auth.util.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const handleBuiltinAuth = () => {
    return async (context: Context, next) => {
        const authCookieId = AuthUtils.findAuthCookie(context);
        if(!authCookieId) {
            (context.request as any).authentication = undefined;
            await next();
            return;
        }

        Mandarine.Global.getSessionContainer().store.get(authCookieId, (error, result: Mandarine.Security.Sessions.MandarineSession) => {
            if(error || !result) return;
            
            (context.request as any).authentication = {
                AUTH_SES_ID: result.sessionID,
                AUTH_EXPIRES: result.expiresAt,
                AUTH_PRINCIPAL: result.sessionData
            }
        }, { touch: true });

        await next();
    }
}