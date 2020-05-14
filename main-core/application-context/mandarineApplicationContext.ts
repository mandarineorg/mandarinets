import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { MandarineSessionContainer } from "../mandarine-native/sessions/sessionDefaultConfiguration.ts";
import { SessionContainer } from "../../security-core/sessions/sessionInterfaces.ts";
import { ComponentTypes } from "../components-registry/componentTypes.ts";

export class ApplicationContext  {

    public static applicationContextSingleton: ApplicationContext;

    public contextMetadata: {    
        startupDate?: number;
    } = {};

    public componentsRegistry: ComponentsRegistry;

    constructor() {
        this.initializeMetadata();
        this.initializeDefaultSessionContainer();
    }

    public getComponentsRegistry(): ComponentsRegistry { 
        if (!(window as any).mandarineComponentsRegistry)
        (window as any).mandarineComponentsRegistry = new ComponentsRegistry();

        return (window as any).mandarineComponentsRegistry;
    }

    private initializeDefaultSessionContainer(): void {
        if (!(window as any).mandarineSessionContainer) (window as any).mandarineSessionContainer = MandarineSessionContainer;
    }

    public initializeMetadata(): void {
        this.contextMetadata.startupDate = Math.round(+new Date()/1000);
    }

    public changeSessionContainer(newSessionContainer: SessionContainer): void {
        let defaultContainer = MandarineSessionContainer;
        
        (window as any).mandarineSessionContainer = <SessionContainer>{
            cookie: {
                path: (newSessionContainer.cookie && newSessionContainer.cookie.path) ? newSessionContainer.cookie.path : defaultContainer.cookie.path,
                maxAge: (newSessionContainer.cookie && newSessionContainer.cookie.maxAge) ? newSessionContainer.cookie.maxAge : defaultContainer.cookie.maxAge,
                httpOnly: (newSessionContainer.cookie && newSessionContainer.cookie.httpOnly) ? newSessionContainer.cookie.httpOnly : defaultContainer.cookie.httpOnly,
                secure: (newSessionContainer.cookie && newSessionContainer.cookie.secure) ? newSessionContainer.cookie.secure : defaultContainer.cookie.secure
            },
            sessionPrefix: (newSessionContainer.sessionPrefix) ? newSessionContainer.sessionPrefix : defaultContainer.sessionPrefix,
            genId: (newSessionContainer.genId) ? newSessionContainer.genId : defaultContainer.genId,
            resave: (newSessionContainer.resave) ? newSessionContainer.resave : defaultContainer.resave,
            rolling: (newSessionContainer.rolling) ? newSessionContainer.rolling : defaultContainer.rolling,
            saveUninitialized: (newSessionContainer.saveUninitialized) ? newSessionContainer.saveUninitialized : defaultContainer.saveUninitialized,
            store: (newSessionContainer.store) ? newSessionContainer.store : defaultContainer.store,
        };
    }

    public static getInstance(): ApplicationContext {
        if(ApplicationContext.applicationContextSingleton == (null || undefined)) { 
            ApplicationContext.applicationContextSingleton = new ApplicationContext(); 
            return ApplicationContext.applicationContextSingleton; 
        }
        return this.applicationContextSingleton;
    }

}