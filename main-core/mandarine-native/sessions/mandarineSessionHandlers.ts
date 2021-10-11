// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Timers } from "../../internals/core/timers.ts";
import { Mandarine } from "../../Mandarine.ns.ts";

class MandarineSessionHandler {

    private expiredSessionHandler: any = undefined;

    public initializeExpirationHandler() {
        const sessionContainer = Mandarine.Global.getSessionContainer().store;
        if(sessionContainer) {
            const expirationInterval = sessionContainer.getExpirationInterval();
            if(sessionContainer.getAutoclearExpiredSessions() && this.expiredSessionHandler === undefined && expirationInterval > 0) {
                this.expiredSessionHandler = Mandarine.MandarineCore.Internals.getTimersManager().add(Timers.MANDARINE_EXPIRED_SESSIONS, 
                    "Interval", 
                    () => sessionContainer.clearExpiredSessions(), 
                    expirationInterval);
            }
        }
    }

    public stopExpirationHandler() {
        Mandarine.MandarineCore.Internals.getTimersManager().delete(this.expiredSessionHandler);
        this.expiredSessionHandler = undefined;
    }

    public initializeSessionManager() {
        const sessionContainerStore = Mandarine.Global.getSessionContainer().store;
        if(sessionContainerStore && sessionContainerStore.launch) {
            sessionContainerStore.launch();
            this.initializeExpirationHandler();
        }
    }

}

export const sessionTimerHandlers = new MandarineSessionHandler();