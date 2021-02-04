// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts"
import { DI } from "../../main-core/dependency-injection/di.ns.ts";
import { DependencyInjectionUtil } from "../../main-core/dependency-injection/di.util.ts";
import { MandarineException } from "../../main-core/exceptions/mandarineException.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { HttpUtils } from "../../main-core/utils/httpUtils.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { ControllerComponent } from "../core/internal/components/routing/controllerContext.ts";
import { openAPIApplicationBuilder, OpenAPILoaderData, openAPILoaderInformation } from "./openapi-global.ts";
import { OpenAPIExternalDocs, OpenAPIOperationObject, OpenAPIParameter, OpenAPIResponse, OpenAPIServer, OpenAPITagObject } from "./openapi-spec.ts";

const saveOpenAPI = () => {
    const path = openAPIApplicationBuilder.getInternalSaveFile();
    if(path) {
        const splitPath = path.toString().split(".");
        const extension = splitPath[splitPath.length - 1].toUpperCase();

        let content: string = "";
        switch(extension) {
        case "JSON":
            content = openAPIApplicationBuilder.toJSON();
            break;
        case "YAML":
        case "YML":
            content = openAPIApplicationBuilder.toYAML();
            break;
            default:
            throw new MandarineException("OpenAPI document must be .json OR .yaml");
        }

        Deno.writeFileSync(path, new TextEncoder().encode(content));
    }
}

export const mandarineOpenAPIInitializer = () => {
    ApplicationContext.getInstance().getComponentsRegistry().getControllers().forEach((componentFromRegistry) => {
        if (componentFromRegistry) {
            const controller: ControllerComponent = componentFromRegistry.componentInstance;
            const component = controller.getClassHandlerType().prototype;
            const openApiComponent = openAPILoaderInformation.get(component);
            const operations: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiOperation") || [];
            const componentresponses: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiResponse" && loaderData.methodName == undefined) || [];


            operations.forEach((loaderData: OpenAPILoaderData) => {
                const data: OpenAPIOperationObject = loaderData.data;
                const methodName: string = <string> loaderData.methodName;
                const routeAction = controller.getRoutingAction(methodName);
                let methodParams: Array<string> = ReflectUtils.getParamNames(component[methodName]);

                if(routeAction) {
                    const fullRoute = controller.getFullRoute(routeAction.route);
                    const httpMethod: string = Mandarine.MandarineMVC.HttpMethods[routeAction.actionType].toLowerCase();
                    
                    const registeredResponses: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiResponse" && loaderData.methodName == methodName) || [];
                    const registeredParameters: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiParameter" && loaderData.methodName == methodName) || [];
                    const registeredServers: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiServer" && loaderData.methodName == methodName) || [];
                    const registeredExternalDoc: OpenAPILoaderData | undefined = openApiComponent?.find((loaderData) => loaderData.type == "ApiExternalDoc" && loaderData.methodName == methodName);
                    const registeredTags: Array<OpenAPILoaderData> = openApiComponent?.filter((loaderData) => loaderData.type == "ApiTag" && loaderData.methodName == methodName) || [];

                    // @ts-ignore
                    const { metadataValues } = DependencyInjectionUtil.getDIHandlerContext(component, methodName, HttpUtils.getFakeRequestContext() as any)
                    const metadataValuesTyped: Array<DI.InjectionMetadataContext> = metadataValues || [];     

                    registeredResponses.forEach((responseLoaderData) => {
                        let responseData: OpenAPIResponse = responseLoaderData.data;

                        if(!responseData.responseCode) {
                            data.responses.default = responseData;
                        } else {
                            const responseCode = responseData.responseCode;
                            delete responseData.responseCode;
                            data.responses[responseCode] = responseData;
                        }

                    });               

                    registeredParameters.forEach((parameterLoaderData) => {
                        let parameterData: OpenAPIParameter = parameterLoaderData.data;
                        let parameterIndex: number | undefined = parameterLoaderData.parameterIndex;
                        let parameterName: string = methodParams[parameterIndex || 0];
                        let parameterMetadata: DI.InjectionMetadataContext | undefined = metadataValuesTyped.find((item) => item.parameterIndex == parameterIndex);

                        if(parameterMetadata) {
                            //TODO(@Andreespirela): Injection type for header too.
                            switch(parameterMetadata.injectionType) {
                                case DI.InjectionTypes.QUERY_PARAM:
                                    parameterData.in = "query";
                                break;
                                case DI.InjectionTypes.COOKIE_PARAM:
                                    parameterData.in = "cookie";
                                break;
                                case DI.InjectionTypes.ROUTE_PARAM:
                                    parameterData.in = "path";
                                break;
                            }

                            const parameterMetadataOriginalType = parameterMetadata.parameterOriginalMetadataType?.toLowerCase();
                            if(parameterMetadata.parameterOriginalMetadataType) {
                                parameterData.schema = parameterData.schema || {
                                    type: parameterMetadataOriginalType
                                }
                            }
                        }

                        if(!parameterData.required) {
                            parameterData.required = false;
                        }

                        // @ts-ignore
                        parameterData["name"] = parameterName;

                        if(!data.parameters) {
                            data.parameters = [];
                        }

                        data.parameters?.push(parameterData)
                    });

                    registeredServers.forEach((serverLoaderData) => {
                        let serverData: OpenAPIServer = serverLoaderData.data;
                        data.servers?.push(serverData);
                    });

                    registeredTags.forEach((item) => {
                        let tagData: Array<OpenAPITagObject> = item.data;
                        let stringTags: Array<string> = tagData.map((item) => item.name);
                        if(!Array.isArray(data.tags)) {
                            data.tags = stringTags;
                        } else {
                            stringTags.forEach((tag) => data.tags?.push(tag));
                        }

                        tagData.forEach((item) => {
                            const keys = Object.keys(item);
                            // It's more than just a `name`
                            if (keys.length > 1) {
                                openAPIApplicationBuilder.setTag(item);
                            }
                        })
                    })

                    if(registeredExternalDoc) {
                        const externalDocData: OpenAPIExternalDocs = registeredExternalDoc.data;
                        data.externalDocs = externalDocData;
                    }

                    openAPIApplicationBuilder.setPath(fullRoute, {
                        [httpMethod]: data
                    });
                }


            });

            componentresponses.forEach((loaderData: OpenAPILoaderData) => {
                const data: OpenAPIResponse = loaderData.data;
                if(data.responseCode) {
                    openAPIApplicationBuilder.setResponse(data.responseCode.toString(), data);
                }
            })
        }
    });

    saveOpenAPI();
}