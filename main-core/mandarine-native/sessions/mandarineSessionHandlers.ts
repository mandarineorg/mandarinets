// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";

class MandarineSessionHandler {

    private expiredSessionHandler: any = undefined;

    public initializeExpirationHandler() {
        const sessionContainer = Mandarine.Global.getSessionContainer().store;
        if(sessionContainer) {
            const expirationInterval = sessionContainer.getExpirationInterval();
            if(sessionContainer.getAutoclearExpiredSessions() && this.expiredSessionHandler === undefined && expirationInterval > 0) {
                this.expiredSessionHandler = setInterval(() => sessionContainer.clearExpiredSessions(), expirationInterval);
            }
        }
    }

    public stopExpirationHandler() {
        clearInterval(this.expiredSessionHandler);
        this.expiredSessionHandler = undefined;
    }

}

export const sessionTimerHandlers = new MandarineSessionHandler();