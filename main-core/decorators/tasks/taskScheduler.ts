// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * Creates a task based on a CRON Expression.
 * It is fired for the first time during Mandarine's start-up process
 * 
 */
export const Scheduled = (cronExpression: string, timeZone?: string) => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerScheduledTask(target, cronExpression, timeZone, methodName);
    }
}

/**
 * **Decorator**
 * Creates a timer with a fixed rate in milliseconds.
 * 
 */
export const Timer = (fixedRateMs: number) => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerTimer(target, fixedRateMs, methodName);
    }
}