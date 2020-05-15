import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ComponentsRegistry } from "../../main-core/components-registry/componentRegistry.ts";
import { ComponentTypes } from "../../main-core/components-registry/componentTypes.ts";
import { ComponentRegistryContext } from "../../main-core/components-registry/componentRegistryContext.ts";
import { MiddlewareComponent } from "../../main-core/components/middleware-component/middlewareComponent.ts";
import { HttpUtils } from "../../main-core/utils/httpUtils.ts";
import { MandarineProperties } from "../../mandarine-properties.ts";
import { getMandarineConfiguration } from "../../main-core/configuration/getMandarineConfiguration.ts";

export class MandarineMvcFrameworkEngineMethods {

    public static initializeEngineMethods() {
        this.initializeInternalManualComponents();
        this.initializeMiddlewares();
    }

    private static initializeInternalManualComponents(): void {
        let appContext: ApplicationContext = ApplicationContext.getInstance();
        let componentsRegistry: ComponentsRegistry = appContext.getComponentsRegistry();
        let manualComponentKeys: Array<string> = componentsRegistry.getAllComponentNamesByType(ComponentTypes.MANUAL_COMPONENT);
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
        if (!(window as any).mandarineMiddlewareComponentNames) { 
            (window as any).mandarineMiddlewareComponentNames = new Array<MiddlewareComponent>();
        }

        // In this process we will store the middleware component in a global array
        // This is because it would be extremely expensive to request the components registry everytime for every request.
        // Since middlewares run on every request.
        let appContext: ApplicationContext = ApplicationContext.getInstance();
        let componentsRegistry: ComponentsRegistry = appContext.getComponentsRegistry();
        let middlewareComponentKeys: Array<string> = componentsRegistry.getAllComponentNamesByType(ComponentTypes.MIDDLEWARE);
        if(middlewareComponentKeys != (null || undefined)) {
            middlewareComponentKeys.forEach((componentName) => {
                let component: ComponentRegistryContext = componentsRegistry.get(componentName);
                let componentInstance: MiddlewareComponent = component.componentInstance;

                componentInstance.verifyHandlerImplementation();

                (window as any).mandarineMiddlewareComponentNames.push(componentInstance);
            });

        }
    }

    public static initializeDefaultsForResponse(response: any) {
        response.redirect = HttpUtils.redirect(response);
        response.headers.set('Content-Type', (<MandarineProperties> getMandarineConfiguration()).mandarine.server.responseType); 
    }
}