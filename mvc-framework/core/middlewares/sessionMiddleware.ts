import { SessionContainer } from "../../../security-core/sessions/sessionInterfaces.ts";
import { SessionsUtils } from "../../../security-core/sessions/sessions.util.ts";
import { MandarineSession } from "../../../security-core/sessions/session.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";
import { Cookies, Cookie, getCookies, setCookie } from "https://deno.land/std@v1.0.0-rc1/http/cookie.ts";
import { Request } from "https://deno.land/x/oak/request.ts";

export class SessionMiddleware {

    private getSessionContainer(): SessionContainer {
        return (window as any).mandarineSessionContainer;
    }

    public createSessionCookie(request: Request, response: any) {
        const sessionContainerConfig: SessionContainer = this.getSessionContainer();

        const cookiesFromRequest: Cookies = getCookies(request.serverRequest);
        let cookiesNames: Array<string> = Object.keys(cookiesFromRequest);
        let sesId: string = undefined;

        let sessionCookieExists: boolean = cookiesNames.some(cookieName => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
        if(!sessionCookieExists) {
            sesId = sessionContainerConfig.genId();

            let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

            setCookie(response, sessionCookie);

            (<any>request).sessionContext = new MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
            (<any>request).sessionID = sesId;
            (<any>request).session = {};
        } else {
            let sessionCookieName: string = cookiesNames.find(cookieName => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
            sesId = cookiesFromRequest[sessionCookieName];
            
            let sessionCookie: Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

            sessionContainerConfig.store.get(sesId, (error, result: MandarineSession) => {

                if(result == undefined) {
                    (<any>request).sessionContext = new MandarineSession(sesId, sessionContainerConfig.store.options.expiration, sessionCookie);
                } else {
                    (<any>request).sessionContext = result;
                }

                if(sessionContainerConfig.rolling) {
                    (<MandarineSession>(<any>request).sessionContext).sessionCookie.expires = new Date(new Date().getTime() + sessionContainerConfig.store.options.expiration);
                }

                (<any>request).sessionID = sesId;
                (<any>request).session = Object.assign({}, (<MandarineSession>(<any>request).sessionContext).sessionData);
            });
        }
    }

    public storeSession(request: Request, response: any) {
        const sessionContainerConfig: SessionContainer = this.getSessionContainer();
        const mandarineSession: MandarineSession = (<MandarineSession>(<any> request).sessionContext);

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