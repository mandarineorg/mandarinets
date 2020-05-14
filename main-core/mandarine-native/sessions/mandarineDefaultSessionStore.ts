import { SessionStore } from "../../../security-core/sessions/sessionInterfaces.ts";
import { MandarineSession } from "../../../security-core/sessions/session.ts";
import { MandarineSessionExceptions } from "../../../security-core/sessions/sessionExceptionsEnum.ts";

export class MandarineStorageHandler implements SessionStore {

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
        if (!(window as any).mandarineSessionsContainer) (window as any).mandarineSessionsContainer = new Array<MandarineSession>();
    }

    public getSessionsContainer() {
        return (window as any).mandarineSessionsContainer;
    }

    public get(sessionId: string, callback: (error, result) => void): void {
        if(!this.exist(sessionId)) {
            callback(MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            let sessionContainer: Array<MandarineSession>;
            this.getAll((error, result) => sessionContainer = result);
            
            let session: MandarineSession = sessionContainer.find(ses => ses.sessionID === sessionId);
            callback(undefined, session);
        }
    }

    public exist(sessionId: string): boolean {
        const sessionContainer: Array<MandarineSession> = this.getSessionsContainer();
        return sessionContainer.some(ses => ses.sessionID === sessionId);
    }

    public getAll(callback: (error, result) => void): void {
        callback(undefined, this.getSessionsContainer());
    }

    public set(sessionID: string, sessionData: MandarineSession, callback: (error, result) => void): void {
        let sessionContainer: Array<MandarineSession> = this.getSessionsContainer();

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
            callback(MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            let sessionContainer: Array<MandarineSession> = this.getSessionsContainer();
            const sessionIndex: number = sessionContainer.findIndex(ses => ses.sessionID === sessionID);
            sessionContainer = sessionContainer.filter(ses => ses.sessionID != sessionID);
            callback(undefined, true);
        }
    }

    public touch(sessionId: string, callback: (error, result) => void): void {
        let now = new Date();
        if(!this.exist(sessionId)) {
            callback(MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            this.get(sessionId, (error, session: MandarineSession) => {

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
        let expiredSessions: Array<MandarineSession> = this.getSessionsContainer().filter((session: MandarineSession) => new Date() > session.expiresAt); 
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