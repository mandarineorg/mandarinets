// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../logger/log.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { ApplicationContext } from "./application-context/mandarineApplicationContext.ts";
import { MandarineTSFrameworkEngineMethods } from "./engine/mandarineTSFrameworkEngineMethods.ts";
import { sessionTimerHandlers } from "./mandarine-native/sessions/mandarineSessionHandlers.ts";
import { Mandarine } from "./Mandarine.ns.ts";
import { MandarineConstants } from "./mandarineConstants.ts";
import { IndependentUtils } from "./utils/independentUtils.ts";
import { MandarineUtils } from "./utils/mandarineUtils.ts";

interface CoreOptions {
    config?: string | object;
}

/**
 * Contains core methods & information related to Mandarine
 */
export class MandarineCore {
    public static releaseVersion: string = MandarineConstants.RELEASE_VERSION;
    
    public static logger: Log = Log.getLogger(MandarineCore);

    public currentContextMetadata = ApplicationContext.CONTEXT_METADATA;

    constructor(options?: CoreOptions) {

        if(options) {
            if(options.config) this.setConfiguration(options.config);
        }

        // ORDER OF THINGS MATTER
        // If the repository proxy is resolved after the dependencies, then the dependencies will have an empty repository
        this.resolveRepositoriesProxy();
        this.resolveComponentsDependencies();
        this.initializeEventListeners();
        this.initializeValueReaders();
        this.initializeWebsocketComponents();

        MandarineTSFrameworkEngineMethods.initializeEngineMethods();

        this.initializeControllers();
        this.initializeTemplates();
        this.initializeEntityManager(); 
        this.freezeMandarineProperties();

        this.initializeTasks();

        this.writeOnCompiler();
    }

    private freezeMandarineProperties(): void {
        Mandarine.Global.getMandarineGlobal().mandarineProperties = <Readonly<any>> MandarineUtils.absoluteZeroFreeze(Mandarine.Global.getMandarineGlobal().mandarineProperties);
    }

    private resolveComponentsDependencies(): void {
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
    }

    private resolveRepositoriesProxy(): void {
        ApplicationContext.getInstance().getComponentsRegistry().connectRepositoriesToProxy();
    }

    private initializeControllers() {
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
    }

    private initializeTemplates() {
        ApplicationContext.getInstance().getTemplateManager().initializeTemplates();
    }

    private initializeEventListeners(): void {
        ApplicationContext.getInstance().getComponentsRegistry().initializeEventListeners();
    }

    private initializeValueReaders(): void {
        ApplicationContext.getInstance().getComponentsRegistry().initializeValueReaders();
    }

    private initializeEntityManager() {
        let entityManager = ApplicationContext.getInstance().getEntityManager();
        if(entityManager.getDataSource() != undefined) {
            entityManager.initializeEssentials();
            entityManager.initializeAllEntities();
        }
    }

    private initializeWebsocketComponents() {
        ApplicationContext.getInstance().getComponentsRegistry().initializeWebsocketComponents();
    }

    private initializeTasks() {
        ApplicationContext.getInstance().getComponentsRegistry().initializeTasks();
    }

    private writeOnCompiler() {
        if(this.currentContextMetadata.engineMetadata?.mvc && this.currentContextMetadata.engineMetadata?.orm) {
            const templatesAmount = this.currentContextMetadata.engineMetadata.mvc.templatesAmount;

            const dbEntitiesAmount = this.currentContextMetadata.engineMetadata.orm.dbEntitiesAmount;
            const repositoriesAmount = this.currentContextMetadata.engineMetadata.orm.repositoriesAmount;

            if(dbEntitiesAmount && dbEntitiesAmount > 0) {
                MandarineCore.logger.compiler(`A total of ${dbEntitiesAmount} database entities have been found`, "info")
            }
            if(repositoriesAmount && repositoriesAmount > 0) {
                MandarineCore.logger.compiler(`A total of ${repositoriesAmount} repositories have been found`, "info")
            }
            if(templatesAmount && templatesAmount > 0) {
                MandarineCore.logger.compiler(`A total of ${templatesAmount} templates have been found`, "info")
            }
        }
    }

    private setConfiguration(config: string | object) {
        if(typeof config === 'string') {
            Mandarine.Global.getMandarineConfiguration(config);
        } else if(IndependentUtils.isObject(config)) {
            // @ts-ignore
            Mandarine.Global.setConfiguration(config);
        }
    }

    /**
     * Creates bridge between Mandarine's core and Mandarine MVC Core.
     * Allows you to create Mandarine-powered web applications.
     */
    public MVC() {
        return new MandarineMVC(() => {
            sessionTimerHandlers.initializeSessionManager();
        }, () => {
            if(this.currentContextMetadata.engineMetadata?.mvc) {
                const controllersAmount = this.currentContextMetadata.engineMetadata.mvc.controllersAmount;
                const middlewareAmount = this.currentContextMetadata.engineMetadata.mvc.middlewareAmount;

                if(controllersAmount && controllersAmount > 0) {
                    MandarineCore.logger.compiler(`A total of ${controllersAmount} controllers have been initialized`, "info");
                } else {
                    MandarineCore.logger.compiler(`No controllers have been found`, "warn")
                }

                if(middlewareAmount && middlewareAmount > 0) {
                    MandarineCore.logger.compiler(`A total of ${middlewareAmount} middleware have been found`, "info");
                }
            }
        });
    }

}