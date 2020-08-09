import { Configuration } from "../../../main-core/decorators/stereotypes/configuration/configuration.ts";
import { Injectable } from "../../../main-core/dependency-injection/decorators/injectable.ts";
import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineCore, MandarineResourceResolver } from "../../../mod.ts";
import { ResourceHandler } from "../../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { Override } from "../../../main-core/decorators/native-components/override.ts";
import { MandarineNative } from "../../../main-core/Mandarine.native.ns.ts";

@Override()
export class WebMvcConfigurer extends MandarineNative.WebMvcConfigurer {

    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry().getNew();
        
        resourceHandlerRegistry.addResourceHandler(
            new ResourceHandler()
            .addResourceHandler(new RegExp("/docs/(.*)"))
            .addResourceHandlerLocation("./docs")
            .addResourceResolver(new MandarineResourceResolver())
        );

        return resourceHandlerRegistry;
    }

}

new MandarineCore().MVC().run({ port: 8091 });