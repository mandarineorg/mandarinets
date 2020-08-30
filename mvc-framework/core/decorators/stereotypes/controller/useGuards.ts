// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineException } from "../../../../../main-core/exceptions/mandarineException.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";
import { GuardTarget } from "../../../../../main-core/internals/interfaces/guardTarget.ts";

export const UseGuards = (guardsList: Array<GuardTarget | any>) => {
    return (target: any, methodName?: string) => {
        if(!guardsList) throw new MandarineException(MandarineException.INVALID_GUARDS_LIST_ANNOTATION);
        MVCDecoratorsProxy.registerUseGuardsDecorator(target, guardsList, methodName);
    }
}