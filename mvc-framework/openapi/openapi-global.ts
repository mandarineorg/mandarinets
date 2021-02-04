// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { OpenAPIBuilder } from "./openApiBuilder.ts";

export interface OpenAPILoaderData {
    type: "ApiOperation" | "ApiParameter" | "ApiResponse" | "ApiServer" | "ApiExternalDoc" | "ApiTag",
    methodName?: string,
    parameterIndex?: number,
    data: any
}

export const openAPILoaderInformation: Map<any, Array<OpenAPILoaderData>> = new Map<any, Array<OpenAPILoaderData>>();

export const addOpenAPILoaderInfo = (component: any, data: OpenAPILoaderData) => {
    if(openAPILoaderInformation.has(component)) {
        openAPILoaderInformation.get(component)?.push(data);
    } else {
        openAPILoaderInformation.set(component, [data]);
    }
}

export let openAPIApplicationBuilder = new OpenAPIBuilder();