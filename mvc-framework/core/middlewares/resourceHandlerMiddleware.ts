// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Middleware } from "../../../deps.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../../mod.ts";
import { handleCors } from "./cors/corsMiddleware.ts";

export const ResourceHandlerMiddleware = () => {
    return async (context: any, next) => {
        const typedContext: Mandarine.Types.RequestContext = context;
        let resourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry = ApplicationContext.getInstance().getResourceHandlerRegistry();

        let resources = resourceHandlerRegistry.getResourceHandlers();
        for(let i = 0; i<resources.length; i++) {
            let resourceHandler = resources[i];

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
                            handleCors(typedContext, resourceHandler.resourceCors, false);
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
        await next();
    }
}