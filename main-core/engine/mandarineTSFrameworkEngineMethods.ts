// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MiddlewareComponent } from "../../main-core/components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";

/**
 * Contains methods that are necessary for the MVC engine to start
 */
export class MandarineTSFrameworkEngineMethods {

    public static logger: Log = Log.getLogger(MandarineTSFrameworkEngineMethods);

    public static initializeEngineMethods() {
        this.initializeMiddlewares();
    }

    private static initializeMiddlewares(): void {
        let middleware: Array<MiddlewareComponent> = Mandarine.Global.getMiddleware();

        // In this process we will store the middleware component in a global array
        // This is because it would be extremely expensive to request the components registry everytime for every request.
        // Since middlewares run on every request.
        let appContext: Mandarine.ApplicationContext.IApplicationContext = ApplicationContext.getInstance();
        let componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry = appContext.getComponentsRegistry();
        let middlewareComponentKeys: Array<string> = componentsRegistry.getAllComponentNamesByType(Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE);
        if(middlewareComponentKeys != (null || undefined)) {
            middlewareComponentKeys.forEach((componentName) => {
                let component: Mandarine.MandarineCore.ComponentRegistryContext = componentsRegistry.get(componentName);
                let componentInstance: MiddlewareComponent = component.componentInstance;

                componentInstance.verifyHandlerImplementation();
                
                if(!componentInstance.regexRoute) return;
                middleware.push(componentInstance);
            });

        }

        ApplicationContext.CONTEXT_METADATA.engineMetadata.mvc.middlewareAmount = middleware.length;
    }
}