import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ComponentsRegistry } from "../../main-core/components-registry/componentRegistry.ts";
import { MiddlewareComponent } from "../../main-core/components/middleware-component/middlewareComponent.ts";
import { HttpUtils } from "../../main-core/utils/httpUtils.ts";
import { getMandarineConfiguration } from "../../main-core/configuration/getMandarineConfiguration.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";

export class MandarineMvcFrameworkEngineMethods {

    public static initializeEngineMethods() {
        this.initializeInternalManualComponents();
        this.initializeMiddlewares();
    }

    private static initializeInternalManualComponents(): void {
        let appContext: Mandarine.ApplicationContext.IApplicationContext = ApplicationContext.getInstance();
        let componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry = appContext.getComponentsRegistry();
        let manualComponentKeys: Array<string> = componentsRegistry.getAllComponentNamesByType(Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT);
        if(manualComponentKeys != (null || undefined)) {
            manualComponentKeys.forEach((componentName) => {
                switch(componentName) {
                    case "getSessionContainer":
                        appContext.changeSessionContainer(componentsRegistry.get(componentName).componentInstance);
                        break;
                }
            });
        }
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

                middleware.push(componentInstance);
            });

        }
    }

    public static initializeDefaultsForResponse(response: any) {
        response.redirect = HttpUtils.redirect(response);
        response.headers.set('Content-Type', getMandarineConfiguration().mandarine.server.responseType); 
    }
}