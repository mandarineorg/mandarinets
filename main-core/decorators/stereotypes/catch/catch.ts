// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Component in the DI Container
 *
 * `@Component()
 *  Target: class`
 */
export const Catch = (exception: any): Function => {
    return (target: any) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.CATCH, {
            exception: exception
        }, undefined);
    };
};