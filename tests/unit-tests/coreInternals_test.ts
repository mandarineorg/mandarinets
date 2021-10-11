// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../mod.ts";
import { DenoAsserts, Orange, Test } from "./../mod.ts";

export class CoreInternals {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test internal core timer manager",
        description: "Should invoke & test functionalities for timer manager in core."
    })
    public async checkInternalCoreTimerManager() {
        const timerManager = Mandarine.MandarineCore.Internals.getTimersManager();

        DenoAsserts.assertEquals(timerManager.timers.length, 0);

        let promiseIntervalResolve: any;
        let promiseInterval = new Promise((resolve) => {
            promiseIntervalResolve = resolve;
        })

        let promiseTimeoutResolve: any;
        let promiseTimeout = new Promise((resolve) => {
            promiseTimeoutResolve = resolve;
        });

        let intervalsTimes = 0;

        timerManager.add("CORE_TEST_INTERVAL", "Interval", () => {
            intervalsTimes = intervalsTimes + 1;
            if(intervalsTimes === 3) {
                promiseIntervalResolve(intervalsTimes);
            }
        }, 1000);

        DenoAsserts.assertEquals(timerManager.timers.length, 1);

        const promiseIntervalResult = await promiseInterval;

        DenoAsserts.assertEquals(promiseIntervalResult, 3);

        timerManager.add("CORE_TEST_TIMEOUT", "Timeout", () => {
            promiseTimeoutResolve("Timeout resolved");
        }, 5000);

        DenoAsserts.assertEquals(timerManager.timers.length, 2);

        const promiseTimeoutResult = await promiseTimeout;

        DenoAsserts.assertEquals(promiseTimeoutResult, "Timeout resolved");

        timerManager.delete("CORE_TEST_TIMEOUT");

        DenoAsserts.assertEquals(timerManager.timers.length, 1);

        timerManager.clearAll();

        DenoAsserts.assertEquals(timerManager.timers.length, 0);

    }

}