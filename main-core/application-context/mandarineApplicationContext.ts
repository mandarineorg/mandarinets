import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { MandarineSessionContainer } from "../mandarine-native/sessions/sessionDefaultConfiguration.ts";
import { SessionContainer } from "../../security-core/sessions/sessionInterfaces.ts";

export class ApplicationContext  {

    public static applicationContextSingleton: ApplicationContext;

    public contextMetadata: {    
        startupDate?: number;
    } = {};

    public componentsRegistry: ComponentsRegistry;

    constructor() {
        this.initializeMetadata();
        this.initializeSessionContainer();
    }

    public getComponentsRegistry(): ComponentsRegistry { 
        if (!(window as any).mandarineComponentsRegistry)
        (window as any).mandarineComponentsRegistry = new ComponentsRegistry();

        return (window as any).mandarineComponentsRegistry;
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