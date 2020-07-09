// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * 
 * Register a component type Configuration in the DI Container
 *
 * `@Configuration()
 *  Target: class`
 */
export const Configuration = (): Function => {
    return (target: any, methodName: string, index: number) => {
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(target, Mandarine.MandarineCore.ComponentTypes.CONFIGURATION, {}, index);
    };
};