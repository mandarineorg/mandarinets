// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CronManager } from "https://deno.land/x/little_crony@v1.0.1/mod.ts";
import { TimerRegistry } from "../../timer-registry/timerRegistry.ts";

export class TaskManager {

    private cronManager: CronManager = new CronManager();
    private timerManager: TimerRegistry = new TimerRegistry();

    /**
     * 
     * Gives access to all the CRON Jobs scheduled in the Mandarine-powered application
     * 
     * @returns an instance of CronManager
     */
    public getCronManager(): CronManager {
        return this.cronManager;
    }

    /**
     * 
     * Gives access to all the timers scheduled in the Mandarine-powered application
     * 
     * @returns an instance of TimerRegistry
     */
    public getTimerManager(): TimerRegistry {
        return this.timerManager;
    }

}