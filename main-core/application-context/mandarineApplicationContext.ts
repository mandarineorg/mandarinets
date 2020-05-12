import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { ApplicationContextMetadata } from "./applicationContextMetadata.ts";
import { MandarineApplicationContextComponentsRegistry } from "./mandarineApplicationContextComponentsRegistry.ts";

export class ApplicationContext extends MandarineApplicationContextComponentsRegistry {

    public static applicationContextSingleton: ApplicationContext;

    public contextMetadata: ApplicationContextMetadata = {};

    public componentsRegistry: ComponentsRegistry;

    constructor() {
        super();
        this.initializeMetadata();
    }

    public getComponentsRegistry(): ComponentsRegistry { 
        if (!(window as any).mandarineComponentsRegistry)
        (window as any).mandarineComponentsRegistry = new ComponentsRegistry();

        return (window as any).mandarineComponentsRegistry;
    }

    public initializeMetadata(): void {
        this.contextMetadata.startupDate = Math.round(+new Date()/1000);
    }

    public static getInstance(): ApplicationContext {
        if(ApplicationContext.applicationContextSingleton == (null || undefined)) { 
            ApplicationContext.applicationContextSingleton = new ApplicationContext(); 
            return ApplicationContext.applicationContextSingleton; 
        }
        return this.applicationContextSingleton;
    }

}