import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ComponentsRegistry } from "../../main-core/components-registry/componentRegistry.ts";
import { ComponentTypes } from "../../main-core/components-registry/componentTypes.ts";

export class MandarineMvcFrameworkEngineMethods {

    public static initializeEngineMethods() {
        this.initializeInternalManualComponents();
    }

    private static initializeInternalManualComponents(): void {
        let appContext: ApplicationContext = ApplicationContext.getInstance();
        let componentsRegistry: ComponentsRegistry = appContext.getComponentsRegistry();
        let manualComponentKeys: Array<string> = componentsRegistry.getAllComponentNamesByType(ComponentTypes.MANUAL_COMPONENT);
        if(manualComponentKeys != (null || undefined)) {
            manualComponentKeys.forEach((componentName) => {
                console.log(componentName);
                switch(componentName) {
                    case "getSessionContainer":
                        appContext.changeSessionContainer(componentsRegistry.get(componentName).componentInstance);
                        break;
                }
            });
        }
    }
}