import { ComponentsRegistry } from "../components-registry/componentRegistry.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineSecurity } from "../../security-core/mandarine-security.ns.ts";

export class ApplicationContext implements Mandarine.ApplicationContext.IApplicationContext {

    public static applicationContextSingleton: Mandarine.ApplicationContext.IApplicationContext;

    public contextMetadata: {    
        startupDate?: number;
    } = {};

    public componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry;

    constructor() {
        this.initializeMetadata();
        this.initializeDefaultSessionContainer();
    }

    public getComponentsRegistry(): Mandarine.MandarineCore.IComponentsRegistry { 
        return Mandarine.Global.getComponentsRegistry();
    }

    private initializeDefaultSessionContainer(): void {
        Mandarine.Global.initializeDefaultSessionContainer();
    }

    public initializeMetadata(): void {
        this.contextMetadata.startupDate = Math.round(+new Date()/1000);
    }

    public changeSessionContainer(newSessionContainer: MandarineSecurity.Sessions.SessionContainer): void {
        let defaultContainer = Mandarine.Defaults.MandarineDefaultSessionContainer;
        let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
        
        mandarineGlobal.mandarineSessionContainer = <MandarineSecurity.Sessions.SessionContainer>{
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

    public static getInstance(): Mandarine.ApplicationContext.IApplicationContext {
        if(ApplicationContext.applicationContextSingleton == (null || undefined)) { 
            ApplicationContext.applicationContextSingleton = new ApplicationContext(); 
            return ApplicationContext.applicationContextSingleton; 
        }
        return this.applicationContextSingleton;
    }

}