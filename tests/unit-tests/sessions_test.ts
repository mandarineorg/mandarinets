// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { sessionTimerHandlers } from "../../main-core/mandarine-native/sessions/mandarineSessionHandlers.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, mockDecorator, Orange, Test, createResolvable } from "../mod.ts";

export class SessionTest {

    @Test({
        name: "Test creation, and expiration of session",
        description: "Should create & remove a session based on its expiration time"
    })
    public testSessionCreateExp() {

        Mandarine.Global.initializeNativeComponents();
        Mandarine.Global.initializeDefaultSessionContainer();
        const sessionContainerStore = Mandarine.Global.getSessionContainer().store;
        if(!sessionContainerStore) {
            throw new Error("Session container is not present");
        }
        if(sessionContainerStore.launch) {
            sessionContainerStore.launch();
        }

        Mandarine.Global.getMandarineConfiguration().mandarine.sessions.expiration = 1000 * 5;

        const createSession = () => sessionContainerStore.set("ABCDID", {
            sessionID: "ABCDID",
            sessionCookie: undefined,
            sessionData: {
                data: "Some value"
            },
            expiresAt: new Date(new Date().getTime() + (1000 * 10)),
            createdAt: new Date(),
            isSessionNew: false
        });
        const newSession = Object.assign({}, createSession());

        CommonUtils.sleep(2);

        const getSession = () => sessionContainerStore.get("ABCDID", { touch: true});
        let currentSession = getSession();
        if(currentSession === undefined) {
            throw new Error("Session was destroyed wait too early");
        }
        if(currentSession.expiresAt === undefined || newSession.expiresAt === undefined) {
            throw new Error("neither session mirror has expiration");
        }

        DenoAsserts.assertEquals(currentSession.expiresAt, new Date(newSession.expiresAt.getTime() + (1000 * 5)));
        DenoAsserts.assert(currentSession.expiresAt > newSession.expiresAt);

        CommonUtils.sleep(20);

        DenoAsserts.assert(new Date() > newSession.expiresAt);
        DenoAsserts.assertEquals(sessionContainerStore.getAll().length, 1);
        const getExpiredSession = sessionContainerStore.get("ABCDID");
        DenoAsserts.assertEquals(getExpiredSession, undefined);
        DenoAsserts.assertEquals(sessionContainerStore.getAll().length, 0);

        CommonUtils.sleep(2);
        let lastSession = Object.assign({}, createSession());
        for(let i=0; i<10; i++) {
            let currentSession = getSession();
            if(currentSession?.expiresAt === undefined || lastSession.expiresAt === undefined) {
                throw new Error("Invalid data")
            }
            DenoAsserts.assert(currentSession.expiresAt > lastSession.expiresAt);
            DenoAsserts.assertEquals(currentSession?.expiresAt, new Date((lastSession.expiresAt?.getTime() || 0) + (1000 * 5)));
            lastSession = Object.assign({}, currentSession);
            CommonUtils.sleep(2);
        }

        CommonUtils.sleep(65);
        DenoAsserts.assertEquals(sessionContainerStore.get("ABCDID"), undefined); // We didn't touch it anymore, should be removed now.
    }

    @Test({
        name: "Test session time handlers",
        description: "Should create & remove a session based on its expiration time by the expiration time handler"
    })
    public async testSessionCreateEx2p() {
        let interval: any;
        try {
            Mandarine.Global.initializeNativeComponents();
            Mandarine.Global.initializeDefaultSessionContainer();
            const sessionContainerStore = Mandarine.Global.getSessionContainer().store;
            if(!sessionContainerStore) {
                throw new Error("Session container is not present");
            }

            Mandarine.Global.getMandarineConfiguration().mandarine.sessions.expirationInterval = (1000 * 12); 
    
            sessionTimerHandlers.initializeSessionManager();
            
            const createSession = () => sessionContainerStore.set("ABCDID", {
                sessionID: "ABCDID",
                sessionCookie: undefined,
                sessionData: {
                    data: "Some value"
                },
                expiresAt: new Date(new Date().getTime() + (1000 * 10)),
                createdAt: new Date(),
                isSessionNew: false
            });
            const newSession = Object.assign({}, createSession());

            CommonUtils.sleep(5);

            const session = sessionContainerStore.get("ABCDID", { touch: false });
            if(session === undefined || session && session.expiresAt === undefined) {
                throw new Error("Session was destroyed wait too soon");
            }
            const currentSes = Object.assign({}, session);
            DenoAsserts.assertEquals(newSession.expiresAt, currentSes.expiresAt);
            let tries = 0;
            const promise = createResolvable();
             interval = setInterval(() => {
                const ses = sessionContainerStore.get("ABCDID", { touch: false });
                if(ses === undefined) {
                    sessionTimerHandlers.stopExpirationHandler();
                    promise.resolve();
                    clearInterval(interval);
                }
                tries = tries + 1;

                if(tries == 7) {
                    promise.reject("ERROR");
                    clearInterval(interval);
                    throw new Error("Session was never cleaned");
                }
            }, (1000 * 3));
            await promise;
            
        } catch (err) {
            sessionTimerHandlers.stopExpirationHandler();
            clearInterval(interval);
            throw err;
        }
        
    }
    

}