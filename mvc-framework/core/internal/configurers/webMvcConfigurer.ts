import { ApplicationContext } from "../../../../main-core/application-context/mandarineApplicationContext.ts";
import { ResourceHandler } from "../components/resource-handler-registry/resourceHandler.ts";
import { getMandarineConfiguration } from "../../../../main-core/configuration/getMandarineConfiguration.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";

export class WebMVCConfigurer {

    constructor() {
        this.addResourceHandlers();
    }

    public addResourceHandlers() {
        let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry();
        let mandarineConfiguration = getMandarineConfiguration();
        resourceHandlerRegistry.addResourceHandler(
        new ResourceHandler()
        .addResourceHandler(new RegExp("/(.*)"))
        .addResourceHandlerLocation(mandarineConfiguration.mandarine.resources.staticFolder)
        );
    }

}