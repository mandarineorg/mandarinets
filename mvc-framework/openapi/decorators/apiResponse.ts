// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { addOpenAPILoaderInfo, openAPIApplicationBuilder } from "../openapi-global.ts";
import { OpenAPIResponse } from "../openapi-spec.ts";

export const ApiResponse = (apiResponse: OpenAPIResponse) => {
    return (target: any, methodName?: string) => {

        if(!methodName && !apiResponse.responseCode) throw new Error("A response code (response name) must be assigned when using @ApiResponse in a class");
        
        addOpenAPILoaderInfo(target, {
            type: "ApiResponse",
            methodName: methodName,
            data: apiResponse
        })
    }
}