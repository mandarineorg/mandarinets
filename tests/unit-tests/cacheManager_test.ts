// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../mod.ts";
import { DenoAsserts, Orange, Test } from "./../mod.ts";

export class CacheManager {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test cache manager",
        description: "Should invoke cache manager, intervals, and verify cleaning."
    })
    public async checkInternalCacheManager() {
        Mandarine.Global.setConfiguration({
            mandarine: {
                server: {
                    cache: {
                        enabled: true,
                        defaultExpiration: 6000,
                        expirationInterval: 2000 
                    }
                }
            }
        });

        const cacheManager = Mandarine.MandarineMVC.Internal.Core.getCacheManager();
        cacheManager.add("MY_KEY", "whatever");

        DenoAsserts.assertEquals(cacheManager.get("MY_KEY"), "whatever");

        cacheManager.enableCleaningInterval();

        let deferredResolve: any;
        let deferred = new Promise((resolve) => {
            deferredResolve = resolve;
        })

        let attempts = 0;
        let interval = setInterval(() => {
            if(attempts <= 4) {
                DenoAsserts.assertEquals(cacheManager.get("MY_KEY"), "whatever");
            } else {
                DenoAsserts.assertEquals(cacheManager.get("MY_KEY"), undefined);
                clearInterval(interval);
                deferredResolve();
            }
            attempts +=1;
        }, 1000);

        await deferred;
        cacheManager.disableCleaningInterval();
    }

}