// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CronManager } from "https://deno.land/x/little_crony@v1.0.1/mod.ts";
import { TimerRegistry } from "../../timer-registry/timerRegistry.ts";

export class TaskManager {

    private cronManager: CronManager = new CronManager();
    private timerManager: TimerRegistry = new TimerRegistry();

    public getCronManager(): CronManager {
        return this.cronManager;
    }

    public getTimerManager(): TimerRegistry {
        return this.timerManager;
    }

}