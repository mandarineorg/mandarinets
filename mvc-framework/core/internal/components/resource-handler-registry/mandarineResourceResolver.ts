import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { Context } from "../../../../../deps.ts";
import { ResourceHandler } from "./resourceHandler.ts";
import { CommonUtils } from "../../../../../main-core/utils/commonUtils.ts";

export class MandarineResourceResolver implements Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver {

    public resolve(httpContext: Context, resourcePath: string): Uint8Array {

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