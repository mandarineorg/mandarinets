// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineException } from "../../exceptions/mandarineException.ts";
import { MiddlewareTarget } from "../../internals/interfaces/middlewareTarget.ts";

export class MiddlewareUtil {
    public static verifyImplementation(middleware: MiddlewareTarget) {
        let isImplementationValid = (middleware.onPostRequest && typeof middleware.onPostRequest === 'function') && (middleware.onPreRequest && typeof middleware.onPreRequest === 'function');
        
        if(isImplementationValid == undefined) throw new MandarineException(MandarineException.MIDDLEWARE_NON_VALID_IMPL);
    }
}