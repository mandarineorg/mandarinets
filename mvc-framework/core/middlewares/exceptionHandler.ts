// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { DI } from "../../../main-core/dependency-injection/di.ns.ts";

export const ExceptionHandler = () => {
    return async (context: any, next: any) => {
        const typedContext: Mandarine.Types.RequestContext = context;
        try {
            await next();
        } catch (error) {
            typedContext.response.status = 500;

            let catchComponents: Array<Mandarine.Types.CatchComponent> = ApplicationContext.getInstance().getDIFactory().getComponentsByComponentType<Mandarine.Types.CatchComponent>(Mandarine.MandarineCore.ComponentTypes.CATCH);
            if(!catchComponents || catchComponents && catchComponents.length === 0) {
                throw error;
            } else {
                const findRightHandler = catchComponents.find((catchComponent: Mandarine.Types.CatchComponent) => error instanceof catchComponent.configuration.exceptionType);
                if(findRightHandler) {
                    const componentHandler = findRightHandler.getClassHandler();
                    
                    let methodArgs: DI.ArgumentValue[] = await DI.Factory.methodArgumentResolver(componentHandler, "catch", typedContext);

                    await (componentHandler["catch"]({
                        getException: () => error,
                        getResponse: () => typedContext.response,
                        getRequest: () => typedContext.request,
                        getTimestamp: () => new Date().toISOString()
                    }, ...methodArgs));
                    
                } else {
                    throw error;
                }
            }
        }
    }
}