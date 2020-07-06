import { Application } from "../deps.ts";
import { Log } from "../logger/log.ts";
import { getMandarineConfiguration } from "../main-core/configuration/getMandarineConfiguration.ts";
import { Mandarine } from "../main-core/Mandarine.ns.ts";
import { ResourceHandlerMiddleware } from "./core/middlewares/resourceHandlerMiddleware.ts";
import { MandarineMvcFrameworkStarter } from "./engine/mandarineMvcFrameworkStarter.ts";

/**
* This class is the bridge between the HTTP server & the Mandarine Compiler.
*/
export class MandarineMVC {

    public logger: Log = Log.getLogger(MandarineMVC);

    constructor() {
        this.getConfiguration();
    }

    private getConfiguration(): Mandarine.Properties {
        return getMandarineConfiguration();
    }

    run() {
        let app: Application = this.initializeMVCApplication();

        let mandarineConfiguration: Mandarine.Properties = this.getConfiguration();
        let serverConfig: string = `127.0.0.1:${mandarineConfiguration.mandarine.server.port}`;

        this.logger.info(`Server has started ~ ${serverConfig}`);

        try {
            setTimeout(async () => {
                app.listen({
                    port: mandarineConfiguration.mandarine.server.port
                });
            }, 1000);
        } catch(error) {
            this.logger.error(`Server has been shut down`, error);
        }
    }

    private initializeMVCApplication(): Application {
        let starter:MandarineMvcFrameworkStarter = new MandarineMvcFrameworkStarter();
        
        let app: Application = new Application()
        .use(starter.getRouter().routes())
        .use(starter.getRouter().allowedMethods())
        .use(ResourceHandlerMiddleware())
        .use(async (ctx, next) => {
            await next();
        });

        app.addEventListener("error", (event) => {
            this.logger.error("Fatal error", event.error);
        });

        return app;
    }
    
}
