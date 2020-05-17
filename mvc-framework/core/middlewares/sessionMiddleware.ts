import { SessionsUtils } from "../../../security-core/sessions/sessions.util.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { getCookies, Cookies, setCookie, Cookie, delCookie } from "https://deno.land/std@0.51.0/http/cookie.ts";
import { Request } from "https://deno.land/x/oak/request.ts";
import { KeyStack } from "../../../security-core/keyStack.ts";
import { Log } from "../../../logger/log.ts";

export class SessionMiddleware {

    private logger: Log = Log.getLogger(SessionMiddleware);

    constructor() {
        this.logger.info("Session handler middleware has been initialized");
    }

    private getSessionContainer(): Mandarine.Security.Sessions.SessionContainer {
        return Mandarine.Global.getSessionContainer();
    }

    private createSessionContext(sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer, response: any, request: Request) {
        let sesId = sessionContainerConfig.genId();
        let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);
        setCookie(response, sessionCookie);
        (<any>request).sessionContext = new Mandarine.Security.Sessions.MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
        (<any>request).sessionID = sesId;
        (<any>request).session = {};
        return sesId;
    }

    public createSessionCookie(request: Request, response: any) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();

        const cookiesFromRequest: Cookies = getCookies(request.serverRequest);
        let cookiesNames: Array<string> = Object.keys(cookiesFromRequest);
        let sesId: string = undefined;

        let sessionCookieExists: boolean = cookiesNames.some((cookieName) => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
        if(!sessionCookieExists) {
            sesId = this.createSessionContext(sessionContainerConfig, response, request);
        } else {
            let sessionCookieName: string = cookiesNames.find(cookieName => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
            sesId = sessionCookieName.split(':')[1];
            let digestData = cookiesFromRequest[sessionCookieName]; // Necessary to verify the signature of the cookie.
            
            let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

            const cookieDataForSignature: string = `${sessionContainerConfig.sessionPrefix}:${sesId}=${sesId}`;

            const isCookieValid: boolean = new KeyStack(sessionContainerConfig.keys).verify(cookieDataForSignature, digestData);

            if(!isCookieValid) {
                // If the signature is invalid then we delete the current cookie since it's a malicious cookie, but we WILL create another cookie for a new session.
                delCookie(response, sessionCookieName);
                // Create context for new session
                this.createSessionContext(sessionContainerConfig, response, request);
                return;
            }

            sessionContainerConfig.store.get(sesId, (error, result: Mandarine.Security.Sessions.MandarineSession) => {

                if(result == undefined) {
                    (<any>request).sessionContext = new Mandarine.Security.Sessions.MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
                } else {
                    (<any>request).sessionContext = result;
                }

                if(sessionContainerConfig.rolling) {
                    (<Mandarine.Security.Sessions.MandarineSession>(<any>request).sessionContext).sessionCookie.expires = new Date(new Date().getTime() + sessionContainerConfig.store.options.expiration);
                }

                (<any>request).sessionID = sesId;
                (<any>request).session = Object.assign({}, (<Mandarine.Security.Sessions.MandarineSession>(<any>request).sessionContext).sessionData);
            });
        }
    }

    public storeSession(request: Request, response: any) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();
        const mandarineSession: Mandarine.Security.Sessions.MandarineSession = (<Mandarine.Security.Sessions.MandarineSession>(<any> request).sessionContext);

        const compareSessionData = CommonUtils.compareObjectKeys(mandarineSession.sessionData, (<any> request).session);
        mandarineSession.sessionData = (<any> request).session;

        if(compareSessionData) {
            if((mandarineSession.isSessionNew && sessionContainerConfig.saveUninitialized != undefined && sessionContainerConfig.saveUninitialized) || (!mandarineSession.isSessionNew && sessionContainerConfig.resave != undefined && sessionContainerConfig.resave)) {
                sessionContainerConfig.store.set((<any> request).sessionID, mandarineSession, (error, result) => {
                    // DO NOTHING
                });
            }
        } else{
            if(mandarineSession.isSessionNew) { mandarineSession.isSessionNew = false; }

            sessionContainerConfig.store.set((<any> request).sessionID, mandarineSession, (error, result) => {
                // DO NOTHING
            });
        }
    }

}