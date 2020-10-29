// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Context } from "../../../deps.ts";
import { AuthUtils } from "../../../security-core/utils/auth.util.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const handleBuiltinAuth = () => {
    return async (context: any, next: Function) => {
        const typedContext: Mandarine.Types.RequestContext = context;
        const authCookieId = AuthUtils.findAuthCookie(typedContext);
        if(!authCookieId) {
            context.request.authentication = undefined;
            await next();
            return;
        }

        const currentAuthSes = Mandarine.Global.getSessionContainer().store?.get(authCookieId, { touch: true });
        if(currentAuthSes) {
            typedContext.request.authentication = {
                AUTH_SES_ID: currentAuthSes.sessionID,
                AUTH_EXPIRES: <Date> currentAuthSes.expiresAt,
                AUTH_PRINCIPAL: currentAuthSes.sessionData
            }
        }

        await next();
    }
}