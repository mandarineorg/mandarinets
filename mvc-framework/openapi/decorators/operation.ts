// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { addOpenAPILoaderInfo, openAPIApplicationBuilder } from "../openapi-global.ts";
import { OpenAPIOperationObject } from "../openapi-spec.ts";

export const ApiOperation = (operation: OpenAPIOperationObject) => {
    return (target: any, methodName: string, propertyDesciptor: PropertyDescriptor) => {

        if(!operation.operationId) operation.operationId = methodName;

        addOpenAPILoaderInfo(target, {
            type: "ApiOperation",
            methodName: methodName,
            data: operation
        })
    }
}