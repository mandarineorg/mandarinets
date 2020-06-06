import { ApplicationContext } from "../../../../main-core/application-context/mandarineApplicationContext.ts";
import { ResourceHandler } from "../components/resource-handler-registry/resourceHandler.ts";
import { getMandarineConfiguration } from "../../../../main-core/configuration/getMandarineConfiguration.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { MandarineResourceResolver } from "../components/resource-handler-registry/mandarineResourceResolver.ts";

export class WebMVCConfigurer implements Mandarine.MandarineMVC.Configurers.WebMVCConfigurer {

    constructor() {
        this.addResourceHandlers();
    }

    public addResourceHandlers(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry();

        let mandarineConfiguration = getMandarineConfiguration();
        if(resourceHandlerRegistry.overriden == false) {
            resourceHandlerRegistry.addResourceHandler(
                new ResourceHandler()
                .addResourceHandler(new RegExp(mandarineConfiguration.mandarine.resources.staticRegExpPattern))
                .addResourceHandlerLocation(mandarineConfiguration.mandarine.resources.staticFolder)
                .addResourceResolver(new MandarineResourceResolver())
            );
        }

        return resourceHandlerRegistry;
    }

}