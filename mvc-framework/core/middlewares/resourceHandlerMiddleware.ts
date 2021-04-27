// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineException } from "../../../main-core/exceptions/mandarineException.ts";
import type { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../../mod.ts";
import { handleCors } from "./cors/corsMiddleware.ts";

let resourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry = null!;
let resources: any = null;

export const ResourceHandlerMiddleware = () => {
    return async (context: any, next: Function) => {
        const typedContext: Mandarine.Types.RequestContext = context;

        if(resourceHandlerRegistry === null) {
            resourceHandlerRegistry = ApplicationContext.getInstance().getResourceHandlerRegistry();
        }
        if(resources === null) {
            resources = resourceHandlerRegistry.getResourceHandlers();
        }

        for(let i = 0; i<resources.length; i++) {
            let resourceHandler = resources[i];

            if(resourceHandler && resourceHandler.resourceHandlerPath && resourceHandler.resourceHandlerLocations && resourceHandler.resourceResolver) {
                if(resourceHandler.resourceHandlerLocations.length === 0) {
                    throw new MandarineException(MandarineException.NEEDED_RESOURCE_HANDLER_LOCATION);
                }
                for(let i = 0; i<resourceHandler.resourceHandlerPath.length; i++) {
                    let resourceHandlerPath = resourceHandler.resourceHandlerPath[i];
                    let resourceHandlerLocation = resourceHandler.resourceHandlerLocations[i];
                    let resourceHandlerIndex;
                    if(resourceHandler.resourceHandlerIndex != undefined && resourceHandler.resourceHandlerIndex.length > 0) resourceHandlerIndex = resourceHandler.resourceHandlerIndex[i];

                    let regex = new RegExp(typedContext.request.url.host + resourceHandlerPath.source);
                    let search = typedContext.request.url.host + typedContext.request.url.pathname;
                    let isMatch = regex.test(search);

                    if(isMatch) {
                        let results = regex.exec(search);

                        if(results != (null || undefined)) {
                            if(resourceHandler.resourceCors) {
                                handleCors(typedContext, {
                                    corsOptions: resourceHandler.resourceCors,
                                    useDefaultCors: false
                                });
                            }
                            
                            let resource = results[1];
                            let index: boolean = false;

                            if(resource === "" || resource == (null || undefined)) {
                                if(resourceHandlerIndex != (null || undefined)) {
                                    resource = `${resourceHandlerLocation}/${resourceHandlerIndex}`;
                                    index = true;
                                } else {
                                    await next();
                                    return;
                                }
                            }
                            
                            resource = (index) ? resource : `${resourceHandlerLocation}/${resource}`;
                            const resourceData = resourceHandler.resourceResolver.resolve(typedContext, resource);
                            typedContext.response.body = resourceData;
                            
                            if(resourceData) {
                                // Resource is valid
                                typedContext.isResource = true;
                            }
                        }
                    }
                }
            }
        }
        await next();
    }
}