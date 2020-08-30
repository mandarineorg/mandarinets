// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Catch in the DI Container
 *
 * `@Catch()
 *  Target: class`
 */
export const Catch = (exception: any): Function => {
    return (target: any) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.CATCH, {
            exceptionType: exception
        }, undefined);
    };
};