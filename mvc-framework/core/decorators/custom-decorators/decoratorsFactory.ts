// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { DI } from "../../../../main-core/dependency-injection/di.ns.ts";
import { MVCDecoratorsProxy } from "../../proxys/mvcCoreDecorators.ts";

/**
 * This function creates a custom parameter decorator (used in a HTTP Handler). With this function, you can establish your own behaviors towards an injection which will be made when processing the handler
 * This function can be generic in order to specify what type of data your parameter will receive, for this it takes two generic arguments (DecoratorData, DecoratorReturn)
 * 
 * @example ```
 *  const UserId = parameterDecoratorFactory<number, number>((context: Mandarine.Types.RequestContextAcessor, data) => context.getRequest().userID);
 * 
 * @Controller()
 * export class MyController {
 *      @GET('/route')
 *      public httpHandler(@UserId() myid: number) {
 *      }
 * }
 * ```
 */
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