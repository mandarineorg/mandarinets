import { MandarineSecurity } from "../../../security-core/mandarine-security.ns.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";

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

        this.store = undefined;
    }

    public set(setData: any): MandarineSessionContainer {
        Object.keys(setData).forEach((item) => {
            this[item] = setData[item];
        });
        return this;
    }
}