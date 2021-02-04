// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { addOpenAPILoaderInfo } from "../openapi-global.ts";
import { OpenAPIExternalDocs } from "../openapi-spec.ts";

export const ApiExternalDoc = (apiExternalDoc: OpenAPIExternalDocs) => {
    return (target: any, methodName: string) => {
        addOpenAPILoaderInfo(target, {
            type: "ApiExternalDoc",
            methodName: methodName,
            data: apiExternalDoc
        })
    }
}