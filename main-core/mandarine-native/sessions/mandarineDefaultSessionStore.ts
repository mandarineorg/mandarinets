import { Mandarine } from "../../Mandarine.ns.ts";

export class MandarineStorageHandler implements Mandarine.Security.Sessions.SessionStore {

    public options = {
        expiration: (1000 * 60 * 60 * 24),
        expirationIntervalHandler: undefined,
        expirationInterval: (1000 * 60 * 60),
        autoclearExpiredSessions: true
    }

    constructor() {
        this.initializeSessionsContainer();
    }

    public initializeSessionsContainer(): void {
        if (!(window as any).mandarineSessionsContainer) (window as any).mandarineSessionsContainer = new Array<Mandarine.Security.Sessions.MandarineSession>();
    }

    public getSessionsContainer() {
        return (window as any).mandarineSessionsContainer;
    }

    public get(sessionId: string, callback: (error, result) => void): void {
        if(!this.exist(sessionId)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            let sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession>;
            this.getAll((error, result) => sessionContainer = result);
            
            let session: Mandarine.Security.Sessions.MandarineSession = sessionContainer.find(ses => ses.sessionID === sessionId);
            callback(undefined, session);
        }
    }

    public exist(sessionId: string): boolean {
        const sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer();
        return sessionContainer.some(ses => ses.sessionID === sessionId);
    }

    public getAll(callback: (error, result) => void): void {
        callback(undefined, this.getSessionsContainer());
    }

    public set(sessionID: string, sessionData: Mandarine.Security.Sessions.MandarineSession, callback: (error, result) => void): void {
        let sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer();

        if(!this.exist(sessionID)) {
           sessionContainer.push(sessionData);
           callback(undefined, sessionData);
        } else {
            const sessionIndex: number = sessionContainer.findIndex(ses => ses.sessionID === sessionID);
            sessionContainer[sessionIndex].sessionData = sessionData.sessionData;
            callback(undefined, sessionContainer[sessionIndex]);
        }
    }

    public destroy(sessionID: string, callback: (error, result) => void): void {
        if(!this.exist(sessionID)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            let sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer();
            const sessionIndex: number = sessionContainer.findIndex(ses => ses.sessionID === sessionID);
            sessionContainer = sessionContainer.filter(ses => ses.sessionID != sessionID);
            callback(undefined, true);
        }
    }

    public touch(sessionId: string, callback: (error, result) => void): void {
        let now = new Date();
        if(!this.exist(sessionId)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            this.get(sessionId, (error, session: Mandarine.Security.Sessions.MandarineSession) => {

                if(session && session.sessionCookie && session.sessionCookie.expires) {
                    session.expiresAt = new Date(session.sessionCookie.expires);
                } else {
                    session.expiresAt = new Date(now.getTime() + this.options.expiration);
                }

                this.set(sessionId, session, (error, callback) => {});
            });
        }
    }

    public clearExpiredSessions(): void {
        let expiredSessions: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer().filter((session: Mandarine.Security.Sessions.MandarineSession) => new Date() > session.expiresAt); 
        expiredSessions.forEach((item) => {
            this.destroy(item.sessionID, (err, callback) => {});
        });
    }

    public startExpiringSessions(): void {
        if(this.options.autoclearExpiredSessions && this.options.expirationIntervalHandler == undefined && this.options.expirationInterval > 0) {
            this.options.expirationIntervalHandler = setInterval(this.clearExpiredSessions, this.options.expirationInterval);
        }
    }

    public stopExpiringSessions(): void {
        if(this.options.expirationIntervalHandler != undefined) {
            this.options.expirationIntervalHandler = undefined;
        }
    }
}