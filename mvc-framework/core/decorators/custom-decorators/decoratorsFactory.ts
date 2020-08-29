// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { DI } from "../../../../main-core/dependency-injection/di.ns.ts";
import { MVCDecoratorsProxy } from "../../proxys/mvcCoreDecorators.ts";

export function parameterDecoratorFactory<DecoratorData = any,
                                          DecoratorReturn = any>(executor: Mandarine.MandarineMVC.CustomDecoratorExecutor<DecoratorData, DecoratorReturn>) {
    return (...data: Array<DecoratorData>) => 
        (target: any, methodName: string, index: number) => {

            const customDecoratorConfig: Mandarine.MandarineMVC.DecoratorFactoryData<DecoratorData, DecoratorReturn> = {
                provider: executor,
                paramData: data
            };

            MVCDecoratorsProxy.registerRoutingParam<Mandarine.MandarineMVC.DecoratorFactoryData<DecoratorData, DecoratorReturn>>(
                target, 
                DI.InjectionTypes.CUSTOM_DECORATOR_PARAM, 
                methodName, 
                index, 
                undefined, 
                customDecoratorConfig
            );
        }
}