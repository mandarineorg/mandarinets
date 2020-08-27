// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Context } from "../../../deps.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";

/**
 * This class represents the default resolver for resources.
 * It is used by Mandarine to resolve static content.
 * It can be overriden or you can create a personalized resolver with your own code.
 * Refer to the documentation https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/resource-handlers/resource-resolver
 */
export class MandarineResourceResolver implements Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver {

    public resolve(httpContext: Mandarine.Types.RequestContext, resourcePath: string): Uint8Array {

        let resourceExt = null;

        if(resourcePath.includes(".")) {
            let extensionsInResource = resourcePath.split(".");
            resourceExt = extensionsInResource[extensionsInResource.length - 1];
        }

        if(CommonUtils.fileDirExists(resourcePath)) {

            let stats: Deno.FileInfo;
        
            try {
                stats = Deno.statSync(resourcePath);
            } catch(error) {
                throw error;
            }
        
            httpContext.response.headers.set("Content-Length", String(stats.size));
            if (!httpContext.response.headers.has("Last-Modified") && stats.mtime) {
                httpContext.response.headers.set("Last-Modified", stats.mtime.toUTCString());
            }
        
            if (!httpContext.response.headers.has("Cache-Control")) {
                const directives = [`max-age=0`];
                httpContext.response.headers.set("Cache-Control", directives.join(","));
            }
        
            if (!httpContext.response.type && resourceExt) {
                httpContext.response.type = `.${resourceExt}`;
            }
        
            return Deno.readFileSync(resourcePath);
        }

    }

}