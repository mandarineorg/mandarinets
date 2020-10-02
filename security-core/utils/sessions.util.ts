// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { KeyStack } from "../keyStack.ts";
import type { Cookie } from "../../mvc-framework/core/interfaces/http/cookie.ts";
// @ts-ignore
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import type { MandarineSecurity } from "../../security-core/mandarine-security.ns.ts";

/**
 * Contains all the util methods used by the session middleware
 */
export class SessionsUtils {
    public static getCookieForSession(sessionContainerConfig: MandarineSecurity.Sessions.SessionContainer, sesId: string): Cookie {
        let sessionCookie: Cookie = {
            name: `${sessionContainerConfig.sessionPrefix}:${sesId}`,
            value: sesId
        };

        if (sessionContainerConfig.cookie && sessionContainerConfig.cookie.path) {
            sessionCookie.path = sessionContainerConfig.cookie.path;
        }
        if (sessionContainerConfig.cookie && sessionContainerConfig.cookie.httpOnly) {
            sessionCookie.httpOnly = sessionContainerConfig.cookie.httpOnly;
        }
        if (sessionContainerConfig.cookie && sessionContainerConfig.cookie.secure) {
            sessionCookie.secure = sessionContainerConfig.cookie.secure;
        }
        if (sessionContainerConfig.cookie && sessionContainerConfig.cookie.maxAge) {
            sessionCookie.maxAge = sessionContainerConfig.cookie.maxAge;
        }

        let expirationTime = sessionContainerConfig?.store?.options?.expiration || 0;
        sessionCookie.expires = new Date(new Date().getTime() + expirationTime);

        sessionCookie.value = new KeyStack(sessionContainerConfig.keys).sign(`${sessionCookie.name}=${sessionCookie.value}`);

        return sessionCookie;
    }

    public static sessionBuilder(session: Mandarine.Security.Sessions.MandarineSession, 
        config: {
            expiration: number
        }): Mandarine.Security.Sessions.MandarineSession {
        let newSession: Mandarine.Security.Sessions.MandarineSession =  {
            sessionID: session.sessionID,
            sessionCookie: session.sessionCookie,
            sessionData: (session.sessionData) ? session.sessionData : {},
            isSessionNew: (session.isSessionNew) ? session.isSessionNew : true,
            createdAt: (session.createdAt) ? session.createdAt : new Date(),
        };
        if(session.sessionCookie && session.sessionCookie.expires) {
            newSession.expiresAt = new Date(session.sessionCookie.expires);
        } else {
            newSession.expiresAt = new Date(new Date().getTime() + config.expiration);
        }

        return newSession;
    }
}
