import { ApplicationContext } from "../../../mod.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { getMandarineConfiguration } from "../../../main-core/configuration/getMandarineConfiguration.ts";
import { send } from "https://deno.land/x/oak@v5.0.0/send.ts";
import { CommonUtils } from "../../../main-core/utils/commonUtils.ts";

export const ResourceHandlerMiddleware = (context) => {
    let resourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry = ApplicationContext.getInstance().getResourceHandlerRegistry();
    let mandarineConfiguration = getMandarineConfiguration();

    resourceHandlerRegistry.getResourceHandlers().forEach((resourceHandler) => {
        let regex = new RegExp(context.request.url.host + resourceHandler.resourceHandlerPath.source);
        let search = context.request.url.host + context.request.url.pathname;
        let isMatch = regex.test(search);
        if(isMatch) {
            let results = regex.exec(search);
            if(results != (null || undefined)) {
                let resource = results[1];
                if(resource == "" || resource == (null || undefined)) {
                    if(mandarineConfiguration.mandarine.resources.staticIndex != (null || undefined)) {
                        resource = `${mandarineConfiguration.mandarine.resources.staticFolder}/${mandarineConfiguration.mandarine.resources.staticIndex}`;
                    } else {
                        return 0;
                    }
                }

                resource = `${mandarineConfiguration.mandarine.resources.staticFolder}/${resource}`;
                
                let resourceExt = null;

                if(resource.includes(".")) {
                    let extensionsInResource = resource.split(".");
                    resourceExt = extensionsInResource[extensionsInResource.length - 1];
                }
                if(CommonUtils.fileDirExists(resource)) {

                    let stats: Deno.FileInfo;

                    try {
                        stats = Deno.statSync(resource);
                    } catch(error) {
                        throw error;
                    }

                    context.response.headers.set("Content-Length", String(stats.size));
                    if (!context.response.headers.has("Last-Modified") && stats.mtime) {
                        context.response.headers.set("Last-Modified", stats.mtime.toUTCString());
                    }

                    context.response.body = Deno.readFileSync(resource);
                }
            }
        }
        

    });
}