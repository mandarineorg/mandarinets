// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

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

    get handle() {
        let app: Application = this.initializeMVCApplication();
        
        let mandarineConfiguration: Mandarine.Properties = Mandarine.Global.getMandarineConfiguration();

        if(this.onRun) {
            this.onRun(this);
        }

        return app.handle;
    }

    constructor(onInitialization?: Function, private readonly onRun?: Function) {
        if(onInitialization) {
            onInitialization(this);
        }
    }

    public run(options?: { hostname?: string, port?: number }) {
        let app: Application = this.initializeMVCApplication();

        let mandarineConfiguration: Mandarine.Properties = Mandarine.Global.getMandarineConfiguration();

        try {
            setTimeout(async () => {
                app.listen({
                    hostname: (options && options.hostname) ? options.hostname : mandarineConfiguration.mandarine.server.host,
                    port: (options && options.port) ? options.port : mandarineConfiguration.mandarine.server.port,
                    signal: Mandarine.MandarineMVC.MVC_ABORT_CONTROLLER.signal
                });
            }, 1000);
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