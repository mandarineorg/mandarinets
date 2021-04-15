// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { DI } from "../dependency-injection/di.ns.ts";
import { Mandarine } from "../Mandarine.ns.ts";

/**
* Contains the "application context" of mandarine.
* The Application Context is used to interact with various namespaces & initializations
*/
export class ApplicationContext implements Mandarine.ApplicationContext.IApplicationContext {

    public static CONTEXT_METADATA: Mandarine.ApplicationContext.ApplicationContextMetadata = {
        startupDate: undefined,
        engineMetadata: {
            orm: {},
            mvc: {}
        }
    };

    public static applicationContextSingleton: Mandarine.ApplicationContext.IApplicationContext;

    constructor() {
        this.initializeMetadata();
    }

    public getComponentsRegistry(): Mandarine.MandarineCore.IComponentsRegistry { 
        return Mandarine.Global.getComponentsRegistry();
    }

    public initializeMetadata(): void {
        ApplicationContext.CONTEXT_METADATA.startupDate = Math.round(+new Date()/1000);
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

    public getMicroserviceManager(): Mandarine.MandarineCore.IMicroserviceManager {
        return Mandarine.Global.getMicroserviceManager();
    }

    public getDIFactory(): DI.FactoryClass {
        return DI.Factory;
    }

    public getResourceHandlerRegistry(): Mandarine.MandarineCore.IResourceHandlerRegistry {
        return Mandarine.Global.getResourceHandlerRegistry();
    }

}