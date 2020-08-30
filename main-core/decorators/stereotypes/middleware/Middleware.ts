// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Middleware in the DI Container
 *
 * `@Middleware(regexRoute: RegExp)
 *  Target: class`
 */
export const Middleware = (regexRoute?: RegExp): Function => {
    return (target: any, methodName: string, index: number) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE, {
            regexRoute: regexRoute
        }, index);
    };
};