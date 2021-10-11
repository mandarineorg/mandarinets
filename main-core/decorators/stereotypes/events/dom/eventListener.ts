// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MainCoreDecoratorProxy } from "../../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a handler for the specified EventTarget
 *
 * ```@EventListener('event')  
 *  Target: Method```
 */
export const EventListener = (eventName: string): Function => {
    return (target: any, methodName: string) => {
        MainCoreDecoratorProxy.registerEventListener(target, eventName, methodName);
    };
};