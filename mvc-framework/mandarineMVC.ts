import { Application } from "https://deno.land/x/oak/mod.ts";
import { MandarineMvcFrameworkStarter } from "./engine/mandarineMvcFrameworkStarter.ts";
import routingErrorHandler from "./core/internal/components/routing/middlewares/routingErrorHandler.ts";
import notFoundHandler from "./core/internal/components/routing/middlewares/notFoundHandler.ts";
import { Log } from "../logger/log.ts";
import { MandarineProperties } from "../mandarine-properties.ts";
import { getMandarineConfiguration } from "../main-core/configuration/getMandarineConfiguration.ts";

export class MandarineMVC {

    public logger: Log = Log.getLogger(MandarineMVC);

    constructor(configuration?: MandarineProperties) {
        this.getConfiguration(configuration);
    }

    private getConfiguration(configuration?: MandarineProperties): MandarineProperties {
        return getMandarineConfiguration(configuration);
    }

    async run() {
        let starter:MandarineMvcFrameworkStarter = new MandarineMvcFrameworkStarter();
        
        let app: Application = new Application();
        app.use(starter.getRouter().routes());
        app.use(starter.getRouter().allowedMethods());
        app.use(routingErrorHandler);
        app.use(notFoundHandler);

        let mandarineConfiguration: MandarineProperties = this.getConfiguration();
        let serverConfig: string = `127.0.0.1:${mandarineConfiguration.mandarine.server.port}`;

        this.logger.info(`Server has started ~ ${serverConfig}`);

        try {
            await app.listen({
                port: mandarineConfiguration.mandarine.server.port
            });
        } catch(error) {
            this.logger.error(`Server has been shut down`, error);
        }
    }
    
}