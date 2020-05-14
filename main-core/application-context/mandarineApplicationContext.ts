import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { ApplicationContextMetadata } from "./applicationContextMetadata.ts";
import { MandarineApplicationContextComponentsRegistry } from "./mandarineApplicationContextComponentsRegistry.ts";
import { MandarineSessionContainer } from "../mandarine-native/sessions/sessionDefaultConfiguration.ts";
import { SessionContainer } from "../../security-core/sessions/sessionInterfaces.ts";

export class ApplicationContext extends MandarineApplicationContextComponentsRegistry {

    public static applicationContextSingleton: ApplicationContext;

    public contextMetadata: ApplicationContextMetadata = {};

    public componentsRegistry: ComponentsRegistry;

    constructor() {
        super();
        this.initializeMetadata();
        this.initializeSessionContainer();
    }

    public getComponentsRegistry(): ComponentsRegistry { 
        if (!(window as any).mandarineComponentsRegistry)
        (window as any).mandarineComponentsRegistry = new ComponentsRegistry();

        return (window as any).mandarineComponentsRegistry;
    }

    public getPredefinedInjectables(): object { 
        if (!(window as any).mandarinePredefinedInjectables) (window as any).mandarinePredefinedInjectables = {};
        return (window as any).mandarinePredefinedInjectables;
    }

    private initializeSessionContainer(): void {
        if (!(window as any).mandarineSessionContainer) (window as any).mandarineSessionContainer = MandarineSessionContainer;
    }

    public initializeMetadata(): void {
        this.contextMetadata.startupDate = Math.round(+new Date()/1000);
    }

    public changeSessionContainer(newSessionContainer: SessionContainer): void {
        (window as any).mandarineSessionContainer = newSessionContainer;
    }

    public static getInstance(): ApplicationContext {
        if(ApplicationContext.applicationContextSingleton == (null || undefined)) { 
            ApplicationContext.applicationContextSingleton = new ApplicationContext(); 
            return ApplicationContext.applicationContextSingleton; 
        }
        return this.applicationContextSingleton;
    }

}