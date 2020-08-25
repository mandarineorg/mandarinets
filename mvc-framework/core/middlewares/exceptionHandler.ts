// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { CatchComponent } from "../../../main-core/components/catch-component/catchComponent.ts";
import { DI } from "../../../main-core/dependency-injection/di.ns.ts";

export const ExceptionHandler = () => {
    return async (context: any, next: any) => {
        try {
            await next();
        } catch (error) {
            context.response.status = 500;

            let catchComponents: Array<CatchComponent> = ApplicationContext.getInstance().getDIFactory().getComponentsByComponentType<CatchComponent>(Mandarine.MandarineCore.ComponentTypes.CATCH);
            if(!catchComponents || catchComponents && catchComponents.length === 0) {
                throw error;
            } else {
                const findRightHandler = catchComponents.find((catchComponent) => error instanceof catchComponent.exceptionType);
                if(findRightHandler) {
                    const componentHandler = findRightHandler.getClassHandler();
                    
                    let methodArgs: DI.ArgumentValue[] = await DI.Factory.methodArgumentResolver(componentHandler, "catch", {
                        fullContext: context,
                        request: context.request,
                        response: context.response,
                        params: context.params,
                        cookies: context.cookies,
                        routingAction: undefined
                    });

                    await (componentHandler["catch"]({
                        getException: () => error,
                        getResponse: () => context.response,
                        getRequest: () => context.request,
                        getTimestamp: () => new Date().toISOString()
                    }, ...methodArgs));
                    
                } else {
                    throw error;
                }
            }
        }
    }
}