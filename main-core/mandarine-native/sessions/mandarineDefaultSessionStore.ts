// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";

/**
 * `MandarineSessionHandler` serves as the default implementation of the `SessionStore`.
 * If not implementation is overriden, you may still use Sessions as this class is already implemented by Mandarine's core
 */
export class MandarineSessionHandler implements Mandarine.Security.Sessions.SessionStore {

    private getSessionsContainer(): Array<Mandarine.Security.Sessions.MandarineSession> {
        return (window as any).mandarineSessionsContainer;
    }

    private setSessionContainer(sessions: Array<Mandarine.Security.Sessions.MandarineSession>) {
        (window as any).mandarineSessionsContainer = sessions;
    }

    public launch() {
        if (!(window as any).mandarineSessionsContainer) (window as any).mandarineSessionsContainer = new Array<Mandarine.Security.Sessions.MandarineSession>();
    }

    public get(sessionID: string, config?: { touch?: boolean }): Mandarine.Security.Sessions.MandarineSession | undefined {
        if(config?.touch === true && this.exists(sessionID)) this.touch(sessionID);

        const session = this.getAll().find(ses => ses.sessionID === sessionID);
        const expiration = session?.expiresAt;

        if(session && expiration && new Date() > expiration) {
            this.destroy(session.sessionID);
            return undefined;
        }

        return session;
    }

    public getAll(): Array<Mandarine.Security.Sessions.MandarineSession> {
        return this.getSessionsContainer();
    }

    public set(sessionID: string, session: Mandarine.Security.Sessions.MandarineSession, config?: { override: boolean }): Mandarine.Security.Sessions.MandarineSession {
        const doesExistAndOverride: boolean = this.exists(sessionID) == true && config?.override === true;
        if(!this.exists(sessionID) || doesExistAndOverride) {
            if(doesExistAndOverride) {
                this.destroy(sessionID);
            }
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
            const currentSession = this.get(sessionID);
            // Even though we verified it exists up there, when we call `.get` it may have been deleted if it expired
            if(currentSession) {
                if(currentSession.expiresAt) {
                    currentSession.expiresAt = new Date(currentSession.expiresAt.getTime() + this.getDefaultExpiration());
                    this.set(sessionID, currentSession, { override: true });
                }
            }
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

    public getDefaultExpiration(): number {
        return Mandarine.Global.getMandarineConfiguration().mandarine.sessions?.expiration || (1000 * 60 * 60 * 24);
    }

    public getExpirationInterval(): number {
        return Mandarine.Global.getMandarineConfiguration().mandarine.sessions?.expirationInterval || (1000 * 60 * 60);
    }

    public getAutoclearExpiredSessions(): boolean {
        return true;
    }
    
}