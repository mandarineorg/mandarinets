// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";

/**
 * `MandarineSessionHandler` serves as the default implementation of the `SessionStore`.
 * If not implementation is overriden, you may still use Sessions as this class is already implemented by Mandarine's core
 */
export class MandarineSessionHandler implements Mandarine.Security.Sessions.SessionStore {

    options: any = {
        expirationInterval: (1000 * 60 * 60),
        autoclearExpiredSessions: true
    }

    private expiredSessionInternalHandler: any | undefined; 

    private initializeSessionsContainer(): void {
        if (!(window as any).mandarineSessionsContainer) (window as any).mandarineSessionsContainer = new Array<Mandarine.Security.Sessions.MandarineSession>();
    }

    private getSessionsContainer(): Array<Mandarine.Security.Sessions.MandarineSession> {
        return (window as any).mandarineSessionsContainer;
    }

    private setSessionContainer(sessions: Array<Mandarine.Security.Sessions.MandarineSession>) {
        (window as any).mandarineSessionsContainer = sessions;
    }

    public launch() {
        this.initializeSessionsContainer();
    }

    public get(sessionID: string, config?: { touch: boolean }): Mandarine.Security.Sessions.MandarineSession | undefined {
        if(config?.touch) this.touch(sessionID);
        return this.getSessionsContainer().find(ses => ses.sessionID === sessionID);
    }

    public getAll(): Array<Mandarine.Security.Sessions.MandarineSession> {
        return this.getSessionsContainer();
    }

    public set(sessionID: string, session: Mandarine.Security.Sessions.MandarineSession, config?: { override: boolean }): Mandarine.Security.Sessions.MandarineSession {
        if(!this.exists(sessionID) || this.exists(sessionID) && config?.override) {
            this.getSessionsContainer().push(session);
            return session;
        } else {
            return <Mandarine.Security.Sessions.MandarineSession> this.get(sessionID);
        }

    }

    public destroy(sessionID: string): void {
        if(this.exists(sessionID)) {
            this.setSessionContainer(this.getSessionsContainer().filter(item => item.sessionID !== sessionID));
        }
    }

    public touch(sessionID: string): Mandarine.Security.Sessions.MandarineSession | undefined {
        const now = new Date();
        if(!this.exists(sessionID)) {
            return undefined;
        } else {
            const currentSession = <Mandarine.Security.Sessions.MandarineSession> this.get(sessionID);
            currentSession.expiresAt = new Date(now.getTime() + this.getDefaultExpiration());
            this.set(sessionID, currentSession, { override: true });
        }
    }

    public exists(sessionID: string): boolean {
        return this.getAll().find(ses => ses.sessionID === sessionID) != undefined;
    }

    public clearExpiredSessions(): void {
        let expiredSessions: Array<Mandarine.Security.Sessions.MandarineSession> = this.getSessionsContainer().filter((session: Mandarine.Security.Sessions.MandarineSession) => new Date() > <Date> session.expiresAt); 
        expiredSessions.forEach((item) => {
            this.destroy(item.sessionID);
        });
    }

    public async startExpiringSessions(): Promise<void> {
        const expirationIntervalHandler = this.getExpirationInterval();
        if(this.options.autoclearExpiredSessions && expirationIntervalHandler == undefined && this.options.expirationInterval > 0) {
            this.setExpirationInterval(setInterval(() => this.clearExpiredSessions(), this.options.expirationInterval));
        }
    }

    public stopIntervals(): void {
        clearInterval(this.options.expirationIntervalHandler);
    }

    public getExpirationInterval() {
        return this.expiredSessionInternalHandler;
    }

    public setExpirationInterval(intervalHandler: any) {
        this.expiredSessionInternalHandler = intervalHandler;
    }

    public getDefaultExpiration(): number {
        return (1000 * 60 * 60 * 24);
    }
}