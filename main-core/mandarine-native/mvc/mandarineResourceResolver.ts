// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../Mandarine.ns.ts";
import { CommonUtils } from "../../utils/commonUtils.ts";
import { Leaf } from "../../../deps.ts";

const getCacheManager = () => {
    return Mandarine.MandarineMVC.Internal.Core.getCacheManager();
}

export interface FileStats {
    valid: boolean;
    size: number;
    mtime: Date | null;
}


/**
 * This class represents the default resolver for resources.
 * It is used by Mandarine to resolve static content.
 * It can be overriden or you can create a personalized resolver with your own code.
 * Refer to the documentation https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/resource-handlers/resource-resolver
 */
export class MandarineResourceResolver implements Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver {

    public async resolve(httpContext: Mandarine.Types.RequestContext, resourcePath: string): Promise<Uint8Array | undefined> {

        const cacheManager = getCacheManager();
        const cacheKey = `RESOURCE_${resourcePath}`;
        let resourceExt = null;

        if(resourcePath.includes(".")) {
            let extensionsInResource = resourcePath.split(".");
            resourceExt = extensionsInResource[extensionsInResource.length - 1];
        }

        const isCacheExistent = cacheManager.has(cacheKey);

        if(!isCacheExistent) {
            const [resourcePathExist, resource] = await CommonUtils.fileDirExistsAsync(resourcePath);
            const fileStats: Partial<FileStats> = {
                valid: resourcePathExist
            };

            if(resourcePathExist === true) {
                fileStats.mtime = resource?.mtime;
                fileStats.size = resource?.size;
            }

            cacheManager.add<FileStats>(cacheKey, <FileStats>fileStats);
        }

        const cache = cacheManager.get<FileStats>(cacheKey);

        if(cache?.valid === true) {

            httpContext.response.headers.set("Content-Length", (cache.size || 0).toString());
            if (!httpContext.response.headers.has("Last-Modified") && cache.mtime) {
                httpContext.response.headers.set("Last-Modified", cache.mtime.toUTCString());
            }
            
            if (!httpContext.response.headers.has("Cache-Control")) {
                const directives = [`max-age=0`];
                httpContext.response.headers.set("Cache-Control", directives.join(","));
            }
            
            if (!httpContext.response.type && resourceExt) {
                httpContext.response.type = `.${resourceExt}`;
            }

            return Leaf.readFile(resourcePath);
        }

    }

}