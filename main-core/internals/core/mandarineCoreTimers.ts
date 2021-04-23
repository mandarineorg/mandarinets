// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log, Mandarine } from "../../../mod.ts";

export class MandarineCoreTimers {

    public static instance: MandarineCoreTimers;
    public logger: Log = Log.getLogger(MandarineCoreTimers);

    public timers: Array<Mandarine.MandarineCore.Internals.CoreTimers> = new Array<Mandarine.MandarineCore.Internals.CoreTimers>();

    public add(key: string, type: Mandarine.MandarineCore.Internals.CoreTimersType, timer: () => void, ms: number): number {
        let timerNum!: number;

        const lowerCaseType = type.toLowerCase();
        if(lowerCaseType === "timeout") {
            timerNum = setTimeout(timer, ms);
        } else if(lowerCaseType === "interval") {
            timerNum = setInterval(timer, ms);
        }

        this.timers.push({
            timerId: timerNum,
            key,
            type
        });

        return timerNum;
    }

    public delete(timerIdOrKey: string | number): void {

        this.logger.debug("Deleting timer");

        const clearBeforeFiltering = (item: Mandarine.MandarineCore.Internals.CoreTimers) => {
            let property: "timerId" | "key" = typeof timerIdOrKey === "number" ? "timerId" : "key";

            if(item[property] === timerIdOrKey) {
                this.clear(item);
            }
            
            return item;
        };

        if(typeof timerIdOrKey === "number") {
            this.timers = this.timers.map(clearBeforeFiltering).filter((item) => item.timerId !== timerIdOrKey);
        } else if(typeof timerIdOrKey === "string") {
            this.timers = this.timers.map(clearBeforeFiltering).filter((item) => item.key !== timerIdOrKey);
        }
    }

    public get(timerIdOrKey: string | number): Mandarine.MandarineCore.Internals.CoreTimers | undefined {
        if(typeof timerIdOrKey === "number") {
            return this.timers.find((item) => item.timerId !== timerIdOrKey);
        } else if(typeof timerIdOrKey === "string") {
            return this.timers.find((item) => item.key !== timerIdOrKey);
        }
    }

    public getByType(type: Mandarine.MandarineCore.Internals.CoreTimersType): Array<Mandarine.MandarineCore.Internals.CoreTimers> {
        return this.timers.filter((item) => item.type === type);
    }

    private clear(item: Mandarine.MandarineCore.Internals.CoreTimers) {
        if(item.type.toLowerCase() === "interval") {
            this.logger.debug("Disattaching interval", item);
            clearInterval(item.timerId);
        } else if(item.type.toLowerCase() === "timeout") {
            this.logger.debug("Disattaching timeout", item);
            clearTimeout(item.timerId);
        }
    }

    public clearAll() {
        this.logger.debug("Deleting all timers");

        this.timers.forEach((item) => {
            this.delete(item.timerId);
        });
    }

    public static getInstance(): MandarineCoreTimers {
        if(!MandarineCoreTimers.instance) {
            MandarineCoreTimers.instance = new MandarineCoreTimers();
        }
        return MandarineCoreTimers.instance;
    }

}