// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../utils/commonUtils.ts";
import { MandarineSessionHandler } from "./mandarineDefaultSessionStore.ts";
import type { MandarineSecurity } from "../../../security-core/mandarine-security.ns.ts";

export class MandarineSessionContainer implements MandarineSecurity.Sessions.SessionContainer {
    public cookie: MandarineSecurity.Sessions.SessionCookie;
    public keys: Array<string> = new Array<string>();
    public sessionPrefix: string;
    public genId: Function;
    public resave: boolean;
    public rolling: boolean;
    public saveUninitialized: boolean;
    public store: MandarineSecurity.Sessions.SessionStore;

    constructor() {
        this.cookie = {
            path: '/', 
            httpOnly: false, 
            secure: false, 
            maxAge: null 
        };

        this.keys = ["mandarine", "orange", "apple", "beer"];

        this.sessionPrefix = "mandarine-session";

        this.genId = CommonUtils.generateUUID;

        this.resave = false;

        this.rolling = false;

        this.saveUninitialized = false;

        this.store = new MandarineSessionHandler();
    }

    public set(setData: any): MandarineSessionContainer {
        Object.keys(setData).forEach((item: any) => {
            (<any>this)[item] = setData[item];
        });
        return this;
    }
}