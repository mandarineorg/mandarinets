import { SessionContainer } from "../../../security-core/sessions/sessionInterfaces.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";
import { MandarineStorageHandler } from "./mandarineDefaultSessionStore.ts";


export const DefaultSessionContainerConfiguration: SessionContainer = {
    cookie: {
            path: '/', 
            httpOnly: false, 
            secure: false, 
            maxAge: null 
    },
    sessionPrefix: "mandarine-session",
    genId: CommonUtils.generateUUID,
    resave: false,
    rolling: false,
    saveUninitialized: false,
    store: new MandarineStorageHandler()
};