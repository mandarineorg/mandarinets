import { MiddlewareComponent } from "./components/middleware-component/middlewareComponent.ts";
import { DI } from "./dependency-injection/di.ns.ts";
import { ComponentsRegistry } from "./components-registry/componentRegistry.ts";
import { CommonUtils } from "./utils/commonUtils.ts";
import { MandarineStorageHandler } from "./mandarine-native/sessions/mandarineDefaultSessionStore.ts";
import { MandarineSecurity } from "../security-core/mandarine-security.ns.ts";
import { MandarineMvc } from "../mvc-framework/mandarine-mvc.ns.ts";

export namespace Mandarine {

   /**
   * Structure of Mandarine Properties.
   * Mandarine uses these properties to determine how it should work
   * Custom Properties must extend Mandarine.Properties
   */
    export interface Properties {
        mandarine: {
            server: {
                host?: string,
                port: number,
                responseType?: MandarineMVC.MediaTypes
            }
        }
    }

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
            mandarineProperties: Properties;
            mandarineMiddleware: Array<MiddlewareComponent>;
        }

        /**
        * Initializes Mandarine Global Environment.
        */
        export function initializeMandarineGlobal() {
            if (!(window as any).mandarineGlobal) {
                (window as any).mandarineGlobal = <MandarineGlobalInterface> {
                    mandarineComponentsRegistry: undefined,
                    mandarineSessionContainer: undefined,
                    mandarineProperties: undefined,
                    mandarineMiddleware: undefined
                }
            }
        }

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
        }

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
        }

        /**
        * Get the list of registered middlewares
        * Middleware are added to the global environment in order to not request the DI container every time there is an HTTP Request
        */
        export function getMiddleware(): Array<MiddlewareComponent> {
            initializeMiddleware();

            return getMandarineGlobal().mandarineMiddleware;
        }

        /**
        * Initializes the Session Container.
        * The session container is used to determine the configuration of Mandarine's sessions
        */
        export function initializeDefaultSessionContainer(): void {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            if(mandarineGlobal.mandarineSessionContainer == (undefined || null)) {
                mandarineGlobal.mandarineSessionContainer = Defaults.MandarineDefaultSessionContainer;
            }
        }

        /**
        * Get the instance of the Session Container
        */
        export function getSessionContainer(): MandarineSecurity.Sessions.SessionContainer {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            return mandarineGlobal.mandarineSessionContainer;

        }

        /**
        * Initializes the middleware list in the global environment.
        */
        export function initializeMiddleware() {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineMiddleware == (undefined || null)) {
                mandarineGlobal.mandarineMiddleware = new Array<MiddlewareComponent>();
            }
        }
    }

    /**
    * Refers to the Application Context.
    * The application context is used to manipulate elemental behaviors of Mandarine
    * It is a singleton class
    */
    export namespace ApplicationContext {
        export interface IApplicationContext {
            componentsRegistry: Mandarine.MandarineCore.IComponentsRegistry;
            getComponentsRegistry(): MandarineCore.IComponentsRegistry;
            initializeMetadata(): void;
            changeSessionContainer(newSessionContainer: MandarineSecurity.Sessions.SessionContainer): void;
            getInstance?: () => ApplicationContext.IApplicationContext;
        }
    }

    /**
    * Refers to all the elements part of the core.
    */
    export namespace MandarineCore {

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
            MANUAL_COMPONENT
        }

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
        }

        /**
        * Refers to the context of the component inside the DI container.
        * When a request is made to the DI container, this is what the request returns.
        */
        export interface ComponentRegistryContext {
            classParentName: string;
            componentName?: string;
            componentInstance: any;
            componentType: ComponentTypes;
        }

        /**
        * Refers to the essentials of a component class for the Mandarine Engine.
        */
        export interface ComponentCommonInterface {
            name?: string;
            classHandler?: any;
            getName: () => string;
            getClassHandler: () => any;
            setClassHandler: (classHandler: any) => void;
        }

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
            getComponentDefinitionNames(componentType?: ComponentTypes): Array<string>;
            isComponentHandlerTypeMatch(componentName: string, classType: any): boolean;
            getComponentByHandlerType(classType: any): ComponentRegistryContext;
            getComponentType(componentName: string): string;
            resolveDependencies(): void;
        }

    }

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
                    port: 4444,
                    responseType: MandarineMVC.MediaTypes.TEXT_HTML
                }
            }
        }

        export const MandarineDefaultSessionContainer: MandarineSecurity.Sessions.SessionContainer = {
            cookie: {
                path: '/', 
                httpOnly: false, 
                secure: false, 
                maxAge: null 
            },
            sessionPrefix: "mandarine-session",
            genId: CommonUtils.generateUUID,
            resave: false,
            rolling: false,
            saveUninitialized: false,
            store: new MandarineStorageHandler()
        }
    }

    /**
    * Refers to the namespace of the Mandarine Security module.
    * Inside this module, you can find everything that is related to the Security Engine, like Sessions.
    */
    export import Security = MandarineSecurity; 
}