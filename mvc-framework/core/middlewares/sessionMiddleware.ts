import { Cookie } from "https://deno.land/std/http/cookie.ts";
import { Cookies } from "../../../deps.ts";
import { Log } from "../../../logger/log.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";
import { HttpUtils } from "../../../main-core/utils/httpUtils.ts";
import { KeyStack } from "../../../security-core/keyStack.ts";
import { SessionsUtils } from "../../../security-core/sessions/sessions.util.ts";

/**
 * This class handles the creation and manipulation of sessions
 * This class works as a middleware and handles the injection of the session object to the request
 */
export class SessionMiddleware {

    private logger: Log = Log.getLogger(SessionMiddleware);

    constructor() {
        this.logger.info("Session handler middleware has been initialized");
    }

    private getSessionContainer(): Mandarine.Security.Sessions.SessionContainer {
        return Mandarine.Global.getSessionContainer();
    }

    private createSessionContext(sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer, context: any) {
        let sesId = sessionContainerConfig.genId();
        let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

        context.cookies.set(sessionCookie.name, sessionCookie.value, {
            domain: sessionCookie.domain,
            expires: sessionCookie.expires,
            httpOnly: sessionCookie.httpOnly,
            maxAge: sessionCookie.maxAge,
            path: sessionCookie.path,
            secure: sessionCookie.secure,
            sameSite: <any>sessionCookie.sameSite,
            signed: false
        });
        
        (<any>context.request).sessionContext = new Mandarine.Security.Sessions.MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
        (<any>context.request).sessionID = sesId;
        (<any>context.request).session = {};
        return sesId;
    }

    public createSessionCookie(context: any) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();

        const cookiesFromRequest: Mandarine.MandarineCore.Cookies = HttpUtils.getCookies(context.request);
        let cookiesNames: Array<string> = Object.keys(cookiesFromRequest);
        let sesId: string = undefined;

        let sessionCookieExists: boolean = cookiesNames.some((cookieName) => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
        if(!sessionCookieExists) {
            sesId = this.createSessionContext(sessionContainerConfig, context);
        } else {
            let sessionCookieName: string = cookiesNames.find(cookieName => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
            sesId = sessionCookieName.split(':')[1];
            let digestData = cookiesFromRequest[sessionCookieName]; // Necessary to verify the signature of the cookie.
            
            let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

            const cookieDataForSignature: string = `${sessionContainerConfig.sessionPrefix}:${sesId}=${sesId}`;

            const isCookieValid: boolean = new KeyStack(sessionContainerConfig.keys).verify(cookieDataForSignature, digestData);

            if(!isCookieValid) {
                // If the signature is invalid then we delete the current cookie since it's a malicious cookie, but we WILL create another cookie for a new session.
                (<Cookies>context.cookies).delete(sessionCookieName);
                // Create context for new session
                this.createSessionContext(sessionContainerConfig, context);
                return;
            }

            sessionContainerConfig.store.get(sesId, (error, result: Mandarine.Security.Sessions.MandarineSession) => {

                if(result == undefined) {
                    (<any>context.request).sessionContext = new Mandarine.Security.Sessions.MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
                } else {
                    (<any>context.request).sessionContext = result;
                }

                if(sessionContainerConfig.rolling) {
                    (<Mandarine.Security.Sessions.MandarineSession>(<any>context.request).sessionContext).sessionCookie.expires = new Date(new Date().getTime() + sessionContainerConfig.store.options.expiration);
                }

                (<any>context.request).sessionID = sesId;
                (<any>context.request).session = Object.assign({}, (<Mandarine.Security.Sessions.MandarineSession>(<any>context.request).sessionContext).sessionData);
            });
        }
    }

    public storeSession(context: any) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();
        const mandarineSession: Mandarine.Security.Sessions.MandarineSession = (<Mandarine.Security.Sessions.MandarineSession>(<any> context.request).sessionContext);

        const compareSessionData = CommonUtils.compareObjectKeys(mandarineSession.sessionData, (<any> context.request).session);
        mandarineSession.sessionData = (<any> context.request).session;

        if(compareSessionData) {
            if((mandarineSession.isSessionNew && sessionContainerConfig.saveUninitialized != undefined && sessionContainerConfig.saveUninitialized) || (!mandarineSession.isSessionNew && sessionContainerConfig.resave != undefined && sessionContainerConfig.resave)) {
                sessionContainerConfig.store.set((<any> context.request).sessionID, mandarineSession, (error, result) => {
                    // DO NOTHING
                });
            }
        } else{
            if(mandarineSession.isSessionNew) { mandarineSession.isSessionNew = false; }

            sessionContainerConfig.store.set((<any> context.request).sessionID, mandarineSession, (error, result) => {
                // DO NOTHING
            });
        }
    }

}