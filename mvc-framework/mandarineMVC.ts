import { Application } from "https://deno.land/x/oak/mod.ts";
import { Configuration } from "./configuration.ts";
import { MandarineMvcFrameworkStarter } from "./engine/mandarineMvcFrameworkStarter.ts";
import routingErrorHandler from "./core/internal/components/routing/middlewares/routingErrorHandler.ts";
import notFoundHandler from "./core/internal/components/routing/middlewares/notFoundHandler.ts";
import { blue } from "https://deno.land/std@v1.0.0-rc1/fmt/colors.ts";
import { Log } from "../logger/log.ts";
import { getMandarineConfiguration } from "./getMandarineConfiguration.ts";

export class MandarineMVC {

    public logger: Log = Log.getLogger(MandarineMVC);

    constructor(configuration?: Configuration) {
        this.getConfiguration(configuration);
    }

    private getConfiguration(configuration?: Configuration): Configuration {
        return getMandarineConfiguration(configuration);
    }

    async run() {
        let starter:MandarineMvcFrameworkStarter = new MandarineMvcFrameworkStarter();
        
        let app: Application = new Application();
        app.use(starter.getRouter().routes());
        app.use(starter.getRouter().allowedMethods());
        app.use(routingErrorHandler);
        app.use(notFoundHandler);

        let mandarineConfiguration: Configuration = this.getConfiguration();
        let serverConfig: string = mandarineConfiguration.getFullServerConfiguration();

        this.logger.info(`Server has started ~ ${serverConfig}`);

        try {
            await app.listen({
                port: mandarineConfiguration.getPort()
            });
        } catch(error) {
            this.logger.error(`Server has been shut down`, error);
        }
    }
    
}