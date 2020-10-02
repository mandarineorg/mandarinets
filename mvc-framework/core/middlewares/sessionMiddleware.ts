// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Cookies } from "../../../deps.ts";
import { Log } from "../../../logger/log.ts";
import { MandarineException } from "../../../main-core/exceptions/mandarineException.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";
import { HttpUtils } from "../../../main-core/utils/httpUtils.ts";
import { KeyStack } from "../../../security-core/keyStack.ts";
import { SessionsUtils } from "../../../security-core/utils/sessions.util.ts";

/**
 * This class handles the creation and manipulation of sessions
 * This class works as a middleware and handles the injection of the session object to the request
 */
export class SessionMiddleware {

    private logger: Log = Log.getLogger(SessionMiddleware);

    constructor() {
        this.logger.compiler("Session handler middleware has been initialized", "info");
    }

    private getSessionContainer(): Mandarine.Security.Sessions.SessionContainer {
        return Mandarine.Global.getSessionContainer();
    }

    private createSessionContext(sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer, context: Mandarine.Types.RequestContext) {
        
        if(!sessionContainerConfig.genId) {
            throw new MandarineException(MandarineException.INVALID_SESSION_GENID);
        }

        let sesId = sessionContainerConfig.genId();
        let sessionCookie: Mandarine.MandarineMVC.Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

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
        
        context.request.sessionContext = SessionsUtils.sessionBuilder({
            sessionID: sesId,
            sessionCookie: sessionCookie
        }, {
            expiration: sessionContainerConfig?.store?.options?.expiration || 0
        });
        
        context.request.sessionID = sesId;
        context.request.session = {};
        return sesId;
    }

    public createSessionCookie(context: Mandarine.Types.RequestContext) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();

        if(!sessionContainerConfig) {
            this.logger.debug("A session cookie was tried to be created but the session container is not initialized");
            return;
        } 

        if(!sessionContainerConfig.store) {
            throw new MandarineException(MandarineException.INVALID_SESSION_GENID);
        }

        const cookiesFromRequest: Mandarine.MandarineCore.Cookies = HttpUtils.getCookies(context.request);
        let cookiesNames: Array<string> = Object.keys(cookiesFromRequest);
        let sesId: string | undefined = undefined;

        let sessionCookieName: string | undefined = cookiesNames.find((cookieName) => cookieName.startsWith(`${sessionContainerConfig.sessionPrefix}`));
        if(!sessionCookieName) {
            sesId = this.createSessionContext(sessionContainerConfig, context);
        } else {
            sesId = sessionCookieName.split(':')[1];
            let digestData = cookiesFromRequest[sessionCookieName]; // Necessary to verify the signature of the cookie.
            
            let sessionCookie: Mandarine.MandarineMVC.Cookie = SessionsUtils.getCookieForSession(sessionContainerConfig, sesId);

            const cookieDataForSignature: string = `${sessionContainerConfig.sessionPrefix}:${sesId}=${sesId}`;

            const isCookieValid: boolean = new KeyStack(sessionContainerConfig.keys).verify(cookieDataForSignature, digestData);

            if(!isCookieValid) {
                // If the signature is invalid then we delete the current cookie since it's a malicious cookie, but we WILL create another cookie for a new session.
                context.cookies.delete(sessionCookieName);
                // Create context for new session
                this.createSessionContext(sessionContainerConfig, context);
                return;
            }

            sessionContainerConfig.store.get(sesId, (error, result: Mandarine.Security.Sessions.MandarineSession | undefined) => {

                if(result == undefined) {
                    context.request.sessionContext = SessionsUtils.sessionBuilder({
                        sessionID: <string> sesId,
                        sessionCookie: sessionCookie
                    }, {
                        expiration: sessionContainerConfig?.store?.options?.expiration || 0
                    });
                    
                } else {
                    context.request.sessionContext = result;
                }

                context.request.sessionID = <string> sesId;
                context.request.session = Object.assign({}, context.request.sessionContext.sessionData);
            }, { touch: true });
        }
    }

    public storeSession(context: Mandarine.Types.RequestContext) {
        const sessionContainerConfig: Mandarine.Security.Sessions.SessionContainer = this.getSessionContainer();

        if(!sessionContainerConfig.store) {
            throw new MandarineException(MandarineException.INVALID_SESSION_GENID);
        }
        
        const mandarineSession: Mandarine.Security.Sessions.MandarineSession = context.request.sessionContext;

        const compareSessionData = CommonUtils.compareObjectKeys(<Mandarine.Security.Sessions.MandarineSession> mandarineSession.sessionData, context.request.session);
        mandarineSession.sessionData = context.request.session;

        if(compareSessionData) {
            if((mandarineSession.isSessionNew && sessionContainerConfig.saveUninitialized != undefined && sessionContainerConfig.saveUninitialized) || (!mandarineSession.isSessionNew && sessionContainerConfig.resave != undefined && sessionContainerConfig.resave)) {
                sessionContainerConfig.store.set(context.request.sessionID, mandarineSession, (error, result) => {
                    // DO NOTHING
                });
            }
        } else{
            if(mandarineSession.isSessionNew) { mandarineSession.isSessionNew = false; }

            sessionContainerConfig.store.set(context.request.sessionID, mandarineSession, (error, result) => {
                // DO NOTHING
            });
        }
    }

}