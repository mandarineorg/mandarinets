// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { NonComponentMiddlewareTarget } from "../../../../../main-core/components/middleware-component/middlewareTarget.ts";
import { MandarineException } from "../../../../../main-core/exceptions/mandarineException.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

export const UseMiddleware = (middlewareList: Array<NonComponentMiddlewareTarget | any>) => {
    return (target: any, methodName?: string) => {
        if(!middlewareList) throw new MandarineException(MandarineException.INVALID_MIDDLEWARE_LIST_ANNOTATION);
        MVCDecoratorsProxy.registerUseMiddlewareDecorator(target, middlewareList, methodName);
    }
}