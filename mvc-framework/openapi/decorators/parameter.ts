import { addOpenAPILoaderInfo, openAPIApplicationBuilder } from "../openapi-global.ts";
import { OpenAPIParameter } from "../openapi-spec.ts";

export const ApiParameter = (parameter: OpenAPIParameter) => {
    return (target: any, methodName: string, parameterIndex: number) => {
        addOpenAPILoaderInfo(target, {
            type: "ApiParameter",
            methodName: methodName,
            parameterIndex: parameterIndex,
            data: parameter
        })
    }
}