import { Application } from "../deps.ts";
import { Log } from "../logger/log.ts";
import { Mandarine } from "../main-core/Mandarine.ns.ts";
import { ResourceHandlerMiddleware } from "./core/middlewares/resourceHandlerMiddleware.ts";
import { MandarineMvcFrameworkStarter } from "./engine/mandarineMvcFrameworkStarter.ts";

/**
* This class is the bridge between the HTTP server & the Mandarine Compiler.
*/
export class MandarineMVC {

    public logger: Log = Log.getLogger(MandarineMVC);

    constructor(onInitialization?: Function, private readonly onRun?: Function) {
        if(onInitialization) {
            onInitialization(this);
        }
    }

    public run() {
        let app: Application = this.initializeMVCApplication();

        let mandarineConfiguration: Mandarine.Properties = Mandarine.Global.getMandarineConfiguration();

        try {
            setTimeout(async () => {
                app.listen({
                    port: mandarineConfiguration.mandarine.server.port
                });
            }, 1000)
        } catch(error) {
            this.logger.compiler(`Server has been shut down`, "error", error);
        }

        if(this.onRun) {
            this.onRun(this);
        }
    }

    private initializeMVCApplication(): Application {

        let starter:MandarineMvcFrameworkStarter = new MandarineMvcFrameworkStarter((engine: MandarineMvcFrameworkStarter) => {
            engine.intializeControllersRoutes();
            engine.initializeEssentials();
        });
        
        let app: Application = new Application()
        .use(starter.getRouter().routes())
        .use(starter.getRouter().allowedMethods())
        .use(ResourceHandlerMiddleware())
        .use(async (ctx, next) => {
            await next();
        });

        app.addEventListener("error", (event) => {
            this.logger.compiler("Fatal error", "error", event.error);
        });

        app.addEventListener("listen", (options) => {
            this.logger.compiler(`Server has started ~ ${options.secure ? "https://" : "http://"}${options.hostname ?? "localhost" }:${options.port}`, "info");
        });
        return app;
    }
    
}