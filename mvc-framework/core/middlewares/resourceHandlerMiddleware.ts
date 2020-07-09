// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Middleware } from "../../../deps.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../../mod.ts";
import { handleCors } from "./cors/corsMiddleware.ts";

export const ResourceHandlerMiddleware = (): Middleware => {
    return async (context, next) => {
        let resourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry = ApplicationContext.getInstance().getResourceHandlerRegistry();

        let resources = resourceHandlerRegistry.getResourceHandlers();
        for(let i = 0; i<resources.length; i++) {
            let resourceHandler = resources[i];

            for(let i = 0; i<resourceHandler.resourceHandlerPath.length; i++) {
                let resourceHandlerPath = resourceHandler.resourceHandlerPath[i];
                let resourceHandlerLocation = resourceHandler.resourceHandlerLocations[i];
                let resourceHandlerIndex;
                if(resourceHandler.resourceHandlerIndex != undefined && resourceHandler.resourceHandlerIndex.length > 0) resourceHandlerIndex = resourceHandler.resourceHandlerIndex[i];

                let regex = new RegExp(context.request.url.host + resourceHandlerPath.source);
                let search = context.request.url.host + context.request.url.pathname;
                let isMatch = regex.test(search);

                if(isMatch) {
                    let results = regex.exec(search);

                    if(results != (null || undefined)) {
                        if(resourceHandler.resourceCors) {
                            handleCors(context, resourceHandler.resourceCors, false);
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
                        context.response.body = resourceHandler.resourceResolver.resolve(context, resource);
                    }
                }
            }
        }
        await next();
    }
}