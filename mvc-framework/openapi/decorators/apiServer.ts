// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { addOpenAPILoaderInfo } from "../openapi-global.ts";
import { OpenAPIServer } from "../openapi-spec.ts";

export const ApiServer = (apiServer: OpenAPIServer) => {
    return (target: any, methodName?: string) => {
        addOpenAPILoaderInfo(target, {
            type: "ApiServer",
            methodName: methodName,
            data: apiServer
        })
    }
}