import { MandarineSecurity } from "../../security-core/mandarine-security.ns.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { Mandarine } from "../Mandarine.ns.ts";

/**
* Contains the "application context" of mandarine.
* The Application Context is used to interact with various namespaces & initializations
*/
export class ApplicationContext implements Mandarine.ApplicationContext.IApplicationContext {

    public static applicationContextSingleton: Mandarine.ApplicationContext.IApplicationContext;

    public contextMetadata: {    
        startupDate?: number;
    } = {};

    public componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry;

    constructor() {
        this.initializeMetadata();
    }

    public getComponentsRegistry(): Mandarine.MandarineCore.IComponentsRegistry { 
        return Mandarine.Global.getComponentsRegistry();
    }

    public initializeDefaultSessionContainer(): void {
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

    public changeResourceHandlers(newResourceHandlerRegistry: Mandarine.MandarineCore.IResourceHandlerRegistry): void {
        if(newResourceHandlerRegistry.getResourceHandlers().length > 0) {
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface  = Mandarine.Global.getMandarineGlobal();
            mandarineGlobal.mandarineResourceHandlerRegistry = newResourceHandlerRegistry;
            mandarineGlobal.mandarineResourceHandlerRegistry.overriden = true;
        } 
    }

    public static getInstance(): Mandarine.ApplicationContext.IApplicationContext {
        if(ApplicationContext.applicationContextSingleton == (null || undefined)) { 
            ApplicationContext.applicationContextSingleton = new ApplicationContext(); 
            return ApplicationContext.applicationContextSingleton; 
        }
        return this.applicationContextSingleton;
    }

    public getEntityManager(): Mandarine.ORM.Entity.EntityManager {
        return Mandarine.Global.getEntityManager();
    }

    public getTemplateManager(): Mandarine.MandarineCore.ITemplatesManager {
        return Mandarine.Global.getTemplateManager();
    }

    public getDIFactory(): DI.FactoryClass {
        return DI.Factory;
    }

    public getResourceHandlerRegistry(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        return Mandarine.Global.getResourceHandlerRegistry();
    }

}