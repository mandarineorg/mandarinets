import { addOpenAPILoaderInfo, openAPIApplicationBuilder } from "../openapi-global.ts";
import { OpenAPIResponse } from "../openapi-spec.ts";

export const ApiResponse = (apiResponse: OpenAPIResponse) => {
    return (target: any, methodName: string) => {
        addOpenAPILoaderInfo(target, {
            type: "ApiResponse",
            methodName: methodName,
            data: apiResponse
        })
    }
}