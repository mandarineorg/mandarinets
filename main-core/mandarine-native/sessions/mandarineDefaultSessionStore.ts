// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";

/**
 * `MandarineSessionHandler` serves as the default implementation of the `SessionStore`.
 * If not implementation is overriden, you may still use Sessions as this class is already implemented by Mandarine's core
 */
export class MandarineSessionHandler implements Mandarine.Security.Sessions.SessionStore {

    public options: any = {
        expiration: (1000 * 60 * 60 * 24),
        expirationIntervalHandler: undefined,
        expirationInterval: (1000 * 60 * 60),
        autoclearExpiredSessions: true
    }

    public launch() {
        this.initializeSessionsContainer();
        this.startExpiringSessions();
    }

    public initializeSessionsContainer(): void {
        if (!(window as any).mandarineSessionsContainer) (window as any).mandarineSessionsContainer = new Array<Mandarine.Security.Sessions.MandarineSession>();
    }

    public getSessionsContainer() {
        return (window as any).mandarineSessionsContainer;
    }

    public get(sessionId: string, callback: (error: any, result: Mandarine.Security.Sessions.MandarineSession | undefined) => void, config?: { touch: boolean }): void {
        if(!this.exist(sessionId)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            
            if(config && config.touch === true) {
                this.touch(sessionId, () => {});
            }

            let sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> | undefined = undefined;
            this.getAll((error: any, result: Array<Mandarine.Security.Sessions.MandarineSession>) => {
                sessionContainer = result 
            
                let session: Mandarine.Security.Sessions.MandarineSession | undefined = sessionContainer?.find((ses: any) => ses.sessionID === sessionId);
                callback(undefined, session);
            });
            
        }
    }

    public exist(sessionId: string): boolean {
        const sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer();
        return sessionContainer.some(ses => ses.sessionID === sessionId);
    }

    public getAll(callback: (error: any, result: Array<Mandarine.Security.Sessions.MandarineSession>) => void): void {
        callback(undefined, this.getSessionsContainer());
    }

    public set(sessionID: string, sessionData: Mandarine.Security.Sessions.MandarineSession, callback: (error: any, result: Mandarine.Security.Sessions.MandarineSession) => void): void {
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

    public destroy(sessionID: string, callback: (error: any, result: Mandarine.Security.Sessions.MandarineSession | undefined | boolean) => void): void {
        if(!this.exist(sessionID)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            let sessionContainer: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer();
            const sessionIndex: number = sessionContainer.findIndex(ses => ses.sessionID === sessionID);
            (window as any).mandarineSessionsContainer = sessionContainer.filter(ses => ses.sessionID != sessionID);
            callback(undefined, true);
        }
    }

    public touch(sessionId: string, callback: (error: any, result: Mandarine.Security.Sessions.MandarineSession | undefined) => void): void {
        let now = new Date();
        if(!this.exist(sessionId)) {
            callback(Mandarine.Security.Sessions.MandarineSessionExceptions.SESSION_NOT_FOUND, undefined);
            return;
        } else {
            this.get(sessionId, (error: any, session: Mandarine.Security.Sessions.MandarineSession | undefined) => {
                if(session) {
                    session.expiresAt = new Date(now.getTime() + this.options.expiration);
                    this.set(sessionId, session, (error, callback) => {});
                }
            });
        }
    }

    public clearExpiredSessions(): void {
        let expiredSessions: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer().filter((session: Mandarine.Security.Sessions.MandarineSession) => new Date() > <Date> session.expiresAt); 
        expiredSessions.forEach((item) => {
            this.destroy(item.sessionID, (err, callback) => {});
        });
    }

    public async startExpiringSessions(): Promise<void> {
        if(this.options.autoclearExpiredSessions && this.options.expirationIntervalHandler == undefined && this.options.expirationInterval > 0) {
            this.options.expirationIntervalHandler = setInterval(() => this.clearExpiredSessions(), this.options.expirationInterval);
        }
    }

    public stopExpiringSessions(): void {
        if(this.options.expirationIntervalHandler != undefined) {
            this.options.expirationIntervalHandler = undefined;
        }
    }

    public stopIntervals(): void {
        clearInterval(this.options.expirationIntervalHandler);
    }
}