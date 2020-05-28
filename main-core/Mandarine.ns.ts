import { MiddlewareComponent } from "./components/middleware-component/middlewareComponent.ts";
import { ComponentsRegistry } from "./components-registry/componentRegistry.ts";
import { CommonUtils } from "./utils/commonUtils.ts";
import { MandarineStorageHandler } from "./mandarine-native/sessions/mandarineDefaultSessionStore.ts";
import { MandarineSecurity } from "../security-core/mandarine-security.ns.ts";
import { MandarineMvc } from "../mvc-framework/mandarine-mvc.ns.ts";
import { MandarineORM } from "../orm-core/mandarine-orm.ns.ts";
import { TemplatesManager } from "./templates-registry/templatesRegistry.ts";
import { TemplateEngineException } from "../mvc-framework/core/exceptions/templateEngineException.ts";

/**
* This namespace contains all the essentials for mandarine to work
* Gnerally, global functionings are added to this namespace in order to be easily accesible across Mandarine
*/
export namespace Mandarine {

    /**
     * Used to verify that a method is async
     */
    export const AsyncFunction = (async () => {}).constructor;

   /**
   * Structure of Mandarine Properties.
   * Mandarine uses these properties to determine how it should work
   * Custom Properties must extend Mandarine.Properties
   */
    export interface Properties {
        [prop: string]: any,
        mandarine: {
            server: {
                host?: string,
                port: number,
                responseType?: MandarineMVC.MediaTypes
            } & any,
            templateEngine: {
                engine: Mandarine.MandarineMVC.TemplateEngine.Engines,
                path: string
            } & any,
            dataSource?: {
                dialect: Mandarine.ORM.Dialect.Dialects,
                data: {
                    host: string,
                    port?: number,
                    username: string,
                    password: string,
                    database: string,
                    poolSize?: number
                } & any
            } & any
        } & any
    };
    /**
    * Handles the interaction with the global environment of Mandarine
    * Mandarine uses a global environment to store and manipulate essential information to work
    */
    export namespace Global {

        /**
        * Contains all the Global objects that Mandarine uses
        */
        export interface MandarineGlobalInterface {
            mandarineComponentsRegistry: MandarineCore.IComponentsRegistry;
            mandarineSessionContainer: MandarineSecurity.Sessions.SessionContainer;
            mandarineEntityManager: Mandarine.ORM.Entity.EntityManager;
            mandarineTemplatesManager: MandarineCore.ITemplatesManager,
            mandarineProperties: Properties;
            mandarineMiddleware: Array<MiddlewareComponent>;
        };

        /**
        * Initializes Mandarine Global Environment.
        */
        export function initializeMandarineGlobal() {
            if (!(window as any).mandarineGlobal) {
                (window as any).mandarineGlobal = <MandarineGlobalInterface> {
                    mandarineComponentsRegistry: undefined,
                    mandarineSessionContainer: undefined,
                    mandarineEntityManager: undefined,
                    mandarineProperties: undefined,
                    mandarineMiddleware: undefined,
                    mandarineTemplatesManager: undefined
                }
            }
        };

        /**
        * Get the global environment based on interface @MandarineGlobalInterface
        */
        export function getMandarineGlobal(): MandarineGlobalInterface {
            initializeMandarineGlobal();
            return (window as any).mandarineGlobal;
        }

        /**
        * Get the Components' registry from Mandarine's global environment
        */
        export function getComponentsRegistry(): Mandarine.MandarineCore.IComponentsRegistry { 
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineComponentsRegistry == (null || undefined)) {
                mandarineGlobal.mandarineComponentsRegistry = new ComponentsRegistry();
            }
    
            return mandarineGlobal.mandarineComponentsRegistry;
        };

        /**
        * Get the entity manager to manipulate the current DB connection
        */
       export function getEntityManager(): MandarineORM.Entity.EntityManager { 
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineEntityManager == (null || undefined)) {
                mandarineGlobal.mandarineEntityManager = new Mandarine.ORM.Entity.EntityManager();
            }

            return mandarineGlobal.mandarineEntityManager;
        };

        /**
        * Get the entity manager to manipulate the current DB connection
        */
       export function getTemplateManager(): Mandarine.MandarineCore.ITemplatesManager { 
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineTemplatesManager == (null || undefined)) {
                mandarineGlobal.mandarineTemplatesManager = new Mandarine.MandarineCore.MandarineTemplateManager();
            }

            return mandarineGlobal.mandarineTemplatesManager;
        };

        /**
        * Get the properties mandarine is using.
        * If no properties are set by the user then it gets the default properties.
        */
        export function getMandarineConfiguration(): Properties {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineProperties == (null || undefined)) {
                mandarineGlobal.mandarineProperties = Defaults.MandarineDefaultConfiguration;
            }
    
            return mandarineGlobal.mandarineProperties;
        };

        /**
        * Set a new configuration for the mandarine properties
        * If properties are ignored, it will set the default values.
        */   
       export function setConfiguration(properties: Properties) {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            let defaultConfiguration: Properties = Defaults.MandarineDefaultConfiguration;

            if(properties.mandarine.server == (null || undefined)) properties.mandarine.server = defaultConfiguration.mandarine.server;
            if(properties.mandarine.server.host == (null || undefined)) properties.mandarine.server.host = defaultConfiguration.mandarine.server.host;
            if(properties.mandarine.server.port == (null || undefined)) properties.mandarine.server.port = defaultConfiguration.mandarine.server.port;
            if(properties.mandarine.server.responseType == (null || undefined)) properties.mandarine.server.responseType = defaultConfiguration.mandarine.server.responseType;
            if(properties.mandarine.templateEngine == (null || undefined)) properties.mandarine.templateEngine = defaultConfiguration.mandarine.templateEngine;
            if(properties.mandarine.templateEngine.path == (null || undefined)) properties.mandarine.templateEngine.path == defaultConfiguration.mandarine.templateEngine.path;
            if(properties.mandarine.templateEngine.engine == (null || undefined)) properties.mandarine.templateEngine.engine == defaultConfiguration.mandarine.templateEngine.engine;

            if(!Object.values(Mandarine.MandarineMVC.TemplateEngine.Engines).includes(properties.mandarine.templateEngine.engine)) throw new TemplateEngineException(TemplateEngineException.INVALID_ENGINE, "MandarineCore");

            mandarineGlobal.mandarineProperties = properties;
       }

        /**
        * Get the list of registered middlewares
        * Middleware are added to the global environment in order to not request the DI container every time there is an HTTP Request
        */
        export function getMiddleware(): Array<MiddlewareComponent> {
            initializeMiddleware();

            return getMandarineGlobal().mandarineMiddleware;
        };

        /**
        * Initializes the Session Container.
        * The session container is used to determine the configuration of Mandarine's sessions
        */
        export function initializeDefaultSessionContainer(): void {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            if(mandarineGlobal.mandarineSessionContainer == (undefined || null)) {
                mandarineGlobal.mandarineSessionContainer = Defaults.MandarineDefaultSessionContainer;
            }
        };

        /**
        * Get the instance of the Session Container
        */
        export function getSessionContainer(): MandarineSecurity.Sessions.SessionContainer {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            return mandarineGlobal.mandarineSessionContainer;

        };

        /**
        * Initializes the middleware list in the global environment.
        */
        export function initializeMiddleware() {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineMiddleware == (undefined || null)) {
                mandarineGlobal.mandarineMiddleware = new Array<MiddlewareComponent>();
            }
        };
    };

    /**
    * Refers to the Application Context.
    * The application context is used to manipulate elemental behaviors of Mandarine
    * It is a singleton class
    */
    export namespace ApplicationContext {
        export interface IApplicationContext {
            componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry;
            getComponentsRegistry(): MandarineCore.IComponentsRegistry;
            getEntityManager(): Mandarine.ORM.Entity.EntityManager;
            getTemplateManager(): Mandarine.MandarineCore.ITemplatesManager;
            initializeMetadata(): void;
            changeSessionContainer(newSessionContainer: MandarineSecurity.Sessions.SessionContainer): void;
            getInstance?: () => ApplicationContext.IApplicationContext;
        }
    };

    /**
    * Refers to all the elements part of the core.
    */
    export namespace MandarineCore {

        export interface Cookies {
            [key: string]: string;
        }

        /**
        * List of all recognizable mandarine components.
        * 
        * MANUAL_COMPONENT refers to components that are not fundamentally a part of Mandarine, but they were declared manually by the user.
        */
        export enum ComponentTypes {
            CONTROLLER,
            COMPONENT,
            SERVICE,
            CONFIGURATION,
            MIDDLEWARE,
            REPOSITORY,
            MANUAL_COMPONENT
        };

        /**
        * Contains the metadata information of the component.
        * This information is initialized when a component decorator is used
        */
        export interface ComponentMetadataContext {
            componentName: string;
            componentType: ComponentTypes;
            componentInstance: any;
            componentConfiguration?: any;
            classParentName: string;
        };

        /**
        * Refers to the context of the component inside the DI container.
        * When a request is made to the DI container, this is what the request returns.
        */
        export interface ComponentRegistryContext {
            classParentName: string;
            componentName?: string;
            componentInstance: any;
            componentType: ComponentTypes;
        };

        /**
        * Refers to the essentials of a component class for the Mandarine Engine.
        */
        export interface ComponentCommonInterface {
            name?: string;
            classHandler?: any;
            getName: () => string;
            getClassHandler: () => any;
            setClassHandler: (classHandler: any) => void;
        };

        /**
        * Refers to the Components' Registry
        * The components' registry is used to communicate the mandarine engine & DI layer
        * This is possibly the most important class for mandarine to work.
        * All components are registered inside this class
        */
        export interface IComponentsRegistry {
            register(componentName: string, componentInstance: any, componentType: ComponentTypes, configuration: any): void;
            get(componentName: string): ComponentRegistryContext;
            update(itemName: string, newValue: ComponentRegistryContext): void;
            exist(itemName: string): boolean;
            getAllComponentNames(): Array<string>
            getAllComponentNamesByType(componentType: ComponentTypes): Array<string>
            getComponents(): ComponentRegistryContext[];
            getControllers(): ComponentRegistryContext[];
            getComponentsByComponentType(componentType: Mandarine.MandarineCore.ComponentTypes): Mandarine.MandarineCore.ComponentRegistryContext[];
            getComponentDefinitionNames(componentType?: ComponentTypes): Array<string>;
            isComponentHandlerTypeMatch(componentName: string, classType: any): boolean;
            getComponentByHandlerType(classType: any): ComponentRegistryContext;
            getComponentType(componentName: string): string;
            resolveDependencies(): void;
            getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext;
            connectRepositoriesToProxy(): void;
        };

        /**
        * Refers to the templates' registry.
        * All the templates that are read and initialized at mandarine compile time are registed inside the templates registry
        * When an user requests a renderable endpoint, the templates' registry will get requested in order to get the template.
        */
        export interface ITemplatesManager {
            register(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines): void;
            getTemplate(templatePath: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, manual: boolean): Mandarine.MandarineMVC.TemplateEngine.Template;
            getFullPath(templatePath: string): string;
            initializeTemplates(): void;
        }

        export class MandarineTemplateManager extends TemplatesManager {}

    };

    /**
    * Refers to the namespace of the Mandarine MVC module.
    * Inside this module, you can find everything that is related to the MVC Engine
    */
    export import MandarineMVC = MandarineMvc;

    /**
    * Contains the default information Mandarine needs to work.
    */
    export namespace Defaults {
        export const MandarineDefaultConfiguration: Properties = {
            mandarine: {
                server: {
                    host: "0.0.0.0",
                    port: 8080,
                    responseType: MandarineMVC.MediaTypes.TEXT_HTML
                },
                templateEngine: {
                    path: "./src/main/resources/templates",
                    engine: "ejs"
                }
            }
        };

        export const MandarineDefaultSessionContainer: MandarineSecurity.Sessions.SessionContainer = {
            cookie: {
                path: '/', 
                httpOnly: false, 
                secure: false, 
                maxAge: null 
            },
            keys: ["mandarine", "orange", "apple", "beer"],
            sessionPrefix: "mandarine-session",
            genId: CommonUtils.generateUUID,
            resave: false,
            rolling: false,
            saveUninitialized: false,
            store: new MandarineStorageHandler()
        };
    };

    /**
    * Refers to the namespace of the Mandarine Security module.
    * Inside this module, you can find everything that is related to the Security Engine, like Sessions.
    */
    export import Security = MandarineSecurity; 

    export import ORM = MandarineORM; 
}