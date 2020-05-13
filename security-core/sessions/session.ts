import { Cookie } from "https://deno.land/std@v1.0.0-rc1/http/cookie.ts";
import { IMandarineSession } from "./sessionInterfaces.ts";

export class MandarineSession implements IMandarineSession {

    public sessionID: string;
    public sessionCookie: Cookie;
    public sessionData: any;
    public isSessionNew?: boolean;
    public expiresAt?: Date;
    public createdAt?: Date;

    constructor(sessionId: string, defaultExpiration: number, sessionCookie: Cookie){
        this.sessionID = sessionId;
        this.sessionCookie = sessionCookie;
        this.sessionData = {};
        this.isSessionNew = true;
        this.createdAt = new Date();

        if(this.sessionCookie && this.sessionCookie.expires) {
            this.expiresAt = new Date(this.sessionCookie.expires);
        } else {
            this.expiresAt = new Date(new Date().getTime() + defaultExpiration);
        }
    }

}