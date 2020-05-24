import { Cookie } from "https://deno.land/std/http/cookie.ts";
import { MandarineSecurity } from "../mandarine-security.ns.ts";
import { KeyStack } from "../keyStack.ts";

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

        sessionCookie.expires = new Date(new Date().getTime() + sessionContainerConfig.store.options.expiration);

        sessionCookie.value = new KeyStack(sessionContainerConfig.keys).sign(`${sessionCookie.name}=${sessionCookie.value}`);

        return sessionCookie;
    }
}
