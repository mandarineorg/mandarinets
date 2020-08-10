// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ResourceHandler } from "../../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { Mandarine } from "../../Mandarine.ns.ts";
import { MandarineSessionContainer } from "../sessions/mandarineSessionContainer.ts";
import { MandarineResourceResolver } from "./mandarineResourceResolver.ts";

export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer, Mandarine.MandarineCore.MandarineNativeComponent<WebMVCConfigurer> {

    public onInitialization(): WebMVCConfigurer {
        this.addResourceHandlers();
        return this;
    }

    public getSessionContainer(): MandarineSessionContainer {
        return new MandarineSessionContainer();
    }

    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry();

        let mandarineConfiguration = Mandarine.Global.getMandarineConfiguration();
        if(resourceHandlerRegistry.overriden == false && mandarineConfiguration.mandarine.resources.staticFolder != (null || undefined) && mandarineConfiguration.mandarine.resources.staticRegExpPattern != (null || undefined)) {
            resourceHandlerRegistry.addResourceHandler(
                new ResourceHandler()
                .addResourceHandler(new RegExp(mandarineConfiguration.mandarine.resources.staticRegExpPattern))
                .addResourceHandlerLocation(mandarineConfiguration.mandarine.resources.staticFolder)
                .addResourceHandlerIndex(mandarineConfiguration.mandarine.resources.staticIndex)
                .addResourceCors(mandarineConfiguration.mandarine.resources.cors)
                .addResourceResolver(new MandarineResourceResolver())
            );
        }

        return resourceHandlerRegistry;
    }

}