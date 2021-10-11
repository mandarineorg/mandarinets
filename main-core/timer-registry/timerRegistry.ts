// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Timers } from "../internals/core/timers.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "../utils/commonUtils.ts";
import { ClassType } from "../utils/utilTypes.ts";

export class TimerRegistry {

    private timers: Array<Mandarine.MandarineCore.TimerMetadataContext> = new Array<Mandarine.MandarineCore.TimerMetadataContext>();

    public create(target: ClassType, methodName: string, fixedRate: number, handler: () => void) {
        this.timers.push({
            handlerType: target,
            fixedRate: fixedRate,
            methodName: methodName,
            interval: Mandarine.MandarineCore.Internals.getTimersManager().add(Timers.MANDARINE_TIMER_REGISTRY.replace("{0}", CommonUtils.generateUUID()), "Interval", handler, fixedRate)
        });
    }

    public get(target: ClassType, methodName: string) {
        return this.timers.find((item) => item.methodName === methodName && item.handlerType === target);
    }

    private disableFromCore(timerId: number) {
        Mandarine.MandarineCore.Internals.getTimersManager().delete(timerId);
    }

    public disable(target: ClassType, methodName: string) {
        const timer = this.get(target, methodName);
        if(timer) {
            this.disableFromCore(timer.interval);
        }
    }

    public delete(target: ClassType, methodName: string) {
        this.disable(target, methodName);
        this.timers = this.timers.filter((item) => item.handlerType !== target && item.methodName !== methodName);
    }

    public deleteAll() {
        this.timers.forEach((item) => this.disableFromCore(item.interval));
        this.timers = [];
    }

}