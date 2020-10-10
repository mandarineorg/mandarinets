// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../logger/log.ts";
import { TemplateEngineException } from "../main-core/exceptions/templateEngineException.ts";
import type { ResourceHandler } from "../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { ResourceHandlerRegistry } from "../mvc-framework/core/internal/components/resource-handler-registry/resourceHandlerRegistry.ts";
import { MandarineMvc } from "../mvc-framework/mandarine-mvc.ns.ts";
import { MandarineORM } from "../orm-core/mandarine-orm.ns.ts";
import { MandarineSecurity } from "../security-core/mandarine-security.ns.ts";
import { ComponentsRegistry } from "./components-registry/componentRegistry.ts";
import type { DI } from "./dependency-injection/di.ns.ts";
import { NativeComponentsRegistry } from "./mandarine-native/nativeComponentsRegistry.ts";
import { AuthenticationManagerBuilder } from "./mandarine-native/security/authenticationManagerBuilderDefault.ts";
// @ts-ignore
import { MandarineMiscellaneous } from "./Mandarine.miscellaneous.ns.ts";
import { MandarineNative } from "./Mandarine.native.ns.ts";
import { MandarineEnvironmentalConstants } from "./MandarineEnvConstants.ts";
import { MandarineLoading } from "./mandarineLoading.ts";
import { TemplatesManager } from "./templates-registry/templatesRegistry.ts";
import { CommonUtils } from "./utils/commonUtils.ts";
import { JsonUtils } from "./utils/jsonUtils.ts";
import { MandarineUtils } from "./utils/mandarineUtils.ts";
import type { CookieConfig } from "../mvc-framework/core/interfaces/http/cookie.ts";
import { HTTPLoginBuilder } from "../security-core/core/modules/loginBuilder.ts";
// @ts-ignore
import { MandarineCommonInterfaces } from "./Mandarine.commonInterfaces.ns.ts";
import type { ComponentComponent } from "./components/component-component/componentComponent.ts";

/**
* This namespace contains all the essentials for mandarine to work
* Gnerally, global functionings are added to this namespace in order to be easily accesible across Mandarine
*/
export namespace Mandarine {

    export const logger: Log = Log.getLogger("MandarineCompiler")

    /**
     * Used to verify that a method is async
     */
    export const AsyncFunction = (async () => {}).constructor;

    export type IniFile = { [prop: string]: string; };

    /**
     * Contains the different properties different stereotypes/components take
     */
    export namespace Components {
        /**
         * Interface that provides with the necessary fields for `configuration` in a Mandarine-powered component stereotype of Middleware
         */
        export interface MiddlewareComponent {
            configuration: {
                regexRoute: RegExp;
            }
        }
        /**
         * Interface that provides with the necessary fields for `configuration` in a Mandarine-powered component stereotype of Catch
         */
        export interface CatchComponent {
            configuration: {
                exceptionType: any;
            }
        }
    }

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
            resources: {
                staticRegExpPattern?: string,
                staticFolder?: string,
                staticIndex?: string,
                cors?: MandarineMVC.CorsMiddlewareOption;
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
            } & any,
            authentication?: {
                expiration?: number,
                cookie?: CookieConfig
            },
            security?: {
                cookiesSignKeys: Array<string>
            }
        } & any
    };

    /**
     * Structure for mandarine.json
     * If mandarine.json is present, some behaviors of the Mandarine starter can be altered such as the location of the properties.json file
     */
    export interface MandarineInitialProperties {
        propertiesFilePath: string | undefined;
        denoEnv: {
            [prop: string]: string
        }
    }

    /**
     * ${MY_VAR} will be considered an environmental reference.
     * The environmental reference will be parsed by CommonUtils.getEnvironmentalReferences
     * and CommonUtils.getEnvironmentalReferences will return an array of EnvironmentalReference
     * 
     * ```
     *  ${MY_VAR}
     *  fullReference: ${MY_VAR}
     *  variable: MY_VAR
     *  environmentalValue: Deno.env.get("MY_VAR")
     * ```
     */
    export interface EnvironmentalReference {
        fullReference: string;
        variable: string;
        environmentalValue: string | undefined;
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
            mandarineEntityManager: Mandarine.ORM.Entity.EntityManager;
            mandarineTemplatesManager: MandarineCore.ITemplatesManager,
            mandarineResourceHandlerRegistry: MandarineCore.IResourceHandlerRegistry
            mandarineProperties: Properties | Readonly<Properties>;
            mandarineInitialProperties: MandarineInitialProperties;
            mandarineMiddleware: Array<ComponentComponent & Components.MiddlewareComponent>;
            mandarineNativeComponentsRegistry: NativeComponentsRegistry;
            __SECURITY__: {
                auth: {
                    authManagerBuilder: MandarineSecurity.Auth.AuthenticationManagerBuilder,
                    httpLoginBuilder: MandarineSecurity.Core.Modules.LoginBuilder
                }
            }
        };

        /**
        * Initializes Mandarine Global Environment.
        */
        export function initializeMandarineGlobal() {
            if (!(window as any).mandarineGlobal) {
                (window as any).mandarineGlobal = {
                    mandarineComponentsRegistry: undefined,
                    mandarineSessionContainer: undefined,
                    mandarineEntityManager: undefined,
                    mandarineProperties: undefined,
                    mandarineMiddleware: undefined,
                    mandarineResourceHandlerRegistry: undefined,
                    mandarineTemplatesManager: undefined,
                    mandarineInitialProperties: undefined,
                    mandarineNativeComponentsRegistry: undefined,
                    __SECURITY__: {
                        auth: {
                            authManagerBuilder: undefined
                        }
                    }
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
        * Get the resource handler registry for incoming requests.
        */
       export function getResourceHandlerRegistry(): Mandarine.MandarineCore.IResourceHandlerRegistry { 
        let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

        if(mandarineGlobal.mandarineResourceHandlerRegistry == (null || undefined)) {
            mandarineGlobal.mandarineResourceHandlerRegistry = new Mandarine.MandarineCore.MandarineResourceHandlerRegistry();
        }

        return mandarineGlobal.mandarineResourceHandlerRegistry;
    };

        /**
        * Get the properties mandarine is using.
        * If no properties are set by the user then it gets the default properties.
        */
        export function getMandarineConfiguration(): Properties {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineProperties == (null || undefined)) {

                try {
                    const initialProperties: MandarineInitialProperties = getMandarineInitialProps();
                    let mandarinePropertiesFile = Deno.env.get(MandarineEnvironmentalConstants.MANDARINE_PROPERTY_FILE) || Defaults.mandarinePropertiesFile;
                    if(initialProperties && initialProperties.propertiesFilePath) mandarinePropertiesFile = initialProperties.propertiesFilePath;
                    const propertiesData = JsonUtils.toJson(mandarinePropertiesFile, { isFile: true, allowEnvironmentalReferences: true });
                    setConfiguration(propertiesData);
                } catch(error) {
                    mandarineGlobal.mandarineProperties = Defaults.MandarineDefaultConfiguration;
                    logger.warn(`properties.json could not be found or parsed. Using default values. `);
                }

            }
    
            return mandarineGlobal.mandarineProperties;
        };

        /**
         * Get the properties (MandarineJsonProperties) from `mandarine.json`
         */
        export function getMandarineInitialProps() {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            let defaultMandarineInitialProps: MandarineInitialProperties = mandarineGlobal.mandarineInitialProperties;

            if(defaultMandarineInitialProps == undefined) {
                defaultMandarineInitialProps = Defaults.MandarineDefaultInitialProperties;
                try {
                    const propertiesEnvVariable = Deno.env.get(MandarineEnvironmentalConstants.MANDARINE_JSON_FILE);
                    const mandarineJsonFile = propertiesEnvVariable || "./mandarine.json";
                    const propertiesData: MandarineInitialProperties = JsonUtils.toJson(mandarineJsonFile, { isFile: true, allowEnvironmentalReferences: false });
                    if(propertiesData) {
                        if(propertiesData.propertiesFilePath) defaultMandarineInitialProps.propertiesFilePath = propertiesData.propertiesFilePath;
                        if(propertiesData.denoEnv) {
                            CommonUtils.setEnvironmentVariablesFromObject(propertiesData.denoEnv);
                            defaultMandarineInitialProps.denoEnv = propertiesData.denoEnv;
                        }
                        mandarineGlobal.mandarineInitialProperties = propertiesData;
                    }

                } catch (error) {
                    MandarineUtils.reThrowError(error);
                }
            }

            return mandarineGlobal.mandarineInitialProperties;
        }

        /**
         * Read .env file located under the current working directory and adds its values to Deno.env
         */
        export function getMandarineDotEnv() {
            let compilerAlert = () => logger.compiler("No `.env` file was found or it could not be read", "warn");
            try {
                if(CommonUtils.fileDirExists('./.env')) {
                    const environmentVariablesString = CommonUtils.readFile('./.env');
                    const enviromentVariables = MandarineUtils.parseConfigurationFile(environmentVariablesString);
                    Object.keys(enviromentVariables).forEach((key) => Deno.env.set(key, enviromentVariables[key]));
                } else {
                    compilerAlert();
                }
            } catch {
                compilerAlert();
            }
        }

        /**
        * Set a new configuration for the mandarine properties
        * If properties are ignored, it will set the default values.
        */   
       export function setConfiguration(properties: Properties) {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            let defaultConfiguration: Properties = Defaults.MandarineDefaultConfiguration;

            if(!properties) (properties as any) = {};
            if(!properties.mandarine) properties.mandarine = {};
            if(properties.mandarine.server == (null || undefined)) properties.mandarine.server = defaultConfiguration.mandarine.server;
            if(properties.mandarine.server.host == (null || undefined)) properties.mandarine.server.host = defaultConfiguration.mandarine.server.host;
            if(properties.mandarine.server.port == (null || undefined)) properties.mandarine.server.port = defaultConfiguration.mandarine.server.port;
            if(properties.mandarine.server.responseType == (null || undefined)) properties.mandarine.server.responseType = defaultConfiguration.mandarine.server.responseType;
            if(properties.mandarine.templateEngine == (null || undefined)) properties.mandarine.templateEngine = defaultConfiguration.mandarine.templateEngine;
            if(properties.mandarine.templateEngine.path == (null || undefined)) properties.mandarine.templateEngine.path = defaultConfiguration.mandarine.templateEngine.path;
            if(properties.mandarine.templateEngine.engine == (null || undefined)) properties.mandarine.templateEngine.engine = defaultConfiguration.mandarine.templateEngine.engine;
            if(properties.mandarine.resources == (null || undefined)) properties.mandarine.resources = defaultConfiguration.mandarine.resources;
            if(properties.mandarine.resources.staticFolder == (null || undefined)) properties.mandarine.resources.staticFolder = defaultConfiguration.mandarine.resources.staticFolder;
            if(properties.mandarine.resources.staticRegExpPattern == (null || undefined)) properties.mandarine.resources.staticRegExpPattern = defaultConfiguration.mandarine.resources.staticRegExpPattern;
            if(properties.mandarine.authentication == (null || undefined)) properties.mandarine.authentication = defaultConfiguration.mandarine.authentication;
            if(properties.mandarine.authentication.expiration == (null || undefined)) properties.mandarine.authentication.expiration = defaultConfiguration.mandarine.authentication.expiration;
            if(properties.mandarine.authentication.cookie == (null || undefined)) properties.mandarine.authentication.cookie = defaultConfiguration.mandarine.authentication.cookie;
            if(properties.mandarine.security == (null || undefined)) properties.mandarine.security = defaultConfiguration.mandarine.security;
            if(properties.mandarine.security.cookiesSignKeys == (null || undefined) || properties.mandarine.security.cookiesSignKeys && properties.mandarine.security.cookiesSignKeys.length == 0) properties.mandarine.security.cookiesSignKeys = defaultConfiguration.mandarine.security.cookiesSignKeys;

            if(!Object.values(Mandarine.MandarineMVC.TemplateEngine.Engines).includes(properties.mandarine.templateEngine.engine)) throw new TemplateEngineException(TemplateEngineException.INVALID_ENGINE);

            mandarineGlobal.mandarineProperties = properties;
       }

        /**
        * Get the list of registered middlewares
        * Middleware are added to the global environment in order to not request the DI container every time there is an HTTP Request
        */
        export function getMiddleware(): Array<ComponentComponent & Components.MiddlewareComponent> {
            initializeMiddleware();
            return getMandarineGlobal().mandarineMiddleware;
        };

        /**
        * Get the instance of the Session Container
        */
        export function getSessionContainer(): MandarineSecurity.Sessions.SessionContainer {
            const mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            return mandarineGlobal.mandarineSessionContainer;
        };

        export function getNativeComponentsRegistry(): NativeComponentsRegistry {
            const mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineNativeComponentsRegistry == (undefined || null)) {
                mandarineGlobal.mandarineNativeComponentsRegistry = new NativeComponentsRegistry();
            }

            return mandarineGlobal.mandarineNativeComponentsRegistry;
        }

        /**
        * Initializes the Session Container.
        * The session container is used to determine the configuration of Mandarine's sessions
        */
        export function initializeDefaultSessionContainer(): void {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            if(mandarineGlobal.mandarineSessionContainer == (undefined || null)) {
                mandarineGlobal.mandarineSessionContainer = Defaults.MandarineDefaultSessionContainer();
            }
        };

        /**
        * Initializes the middleware list in the global environment.
        */
        export function initializeMiddleware() {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineMiddleware == (undefined || null)) {
                mandarineGlobal.mandarineMiddleware = new Array<ComponentComponent & Components.MiddlewareComponent>();
            }
        };

        /**
        * Initializes the middleware list in the global environment.
        */
        export function initializeNativeComponents() {
            const componentRegistry = getNativeComponentsRegistry();
        };

        /**
         * Initializes the core modules of Mandarine's security core.
         */
        export function initializeSecurityInternals() {
            let mandarineGlobal: Mandarine.Global.MandarineGlobalInterface = Mandarine.Global.getMandarineGlobal();
            if(!mandarineGlobal.__SECURITY__.auth.authManagerBuilder) {
                mandarineGlobal.__SECURITY__.auth.authManagerBuilder = new AuthenticationManagerBuilder()
            }
            if(!mandarineGlobal.__SECURITY__.auth.httpLoginBuilder) {
                mandarineGlobal.__SECURITY__.auth.httpLoginBuilder = new HTTPLoginBuilder()
            }
        }
    };

    /**
    * Refers to the Application Context.
    * The application context is used to manipulate elemental behaviors of Mandarine
    * It is a singleton class
    */
    export namespace ApplicationContext {

        /**
         * Stats/Metadata of Mandarine's core.
         * This includes information such as: When Mandarine was started, number of templates, controller, and others.
         */
        export interface ApplicationContextMetadata {    
            startupDate?: number;
            engineMetadata?: {
                orm?: {
                    dbEntitiesAmount?: number;
                    repositoriesAmount?: number;
                },
                mvc?: {
                    middlewareAmount?: number;
                    templatesAmount?: number;
                    controllersAmount?: number;
                }
            }
        }

        /**
         * Interface used by the `ApplicationContext` class. Such class contains the necessary bridges for Mandarine's core to work
         */
        export interface IApplicationContext {
            getComponentsRegistry(): MandarineCore.IComponentsRegistry;
            getEntityManager(): Mandarine.ORM.Entity.EntityManager;
            getTemplateManager(): Mandarine.MandarineCore.ITemplatesManager;
            initializeMetadata(): void;
            getInstance?: () => ApplicationContext.IApplicationContext;
            getDIFactory(): DI.FactoryClass;
            getResourceHandlerRegistry(): Mandarine.MandarineCore.IResourceHandlerRegistry;
        }
    };

    /**
    * Refers to all the elements part of the core.
    */
    export namespace MandarineCore {

        export enum ValueScopes {
            CONFIGURATION,
            ENVIRONMENTAL
        }

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
            CATCH,
            SERVICE,
            CONFIGURATION,
            MIDDLEWARE,
            REPOSITORY,
            MANUAL_COMPONENT,
            GUARDS
        };

        /**
        * List of all native components by Mandarine
        * 
        * Native components are classes that Mandarine uses in order to fully work properly. They can be then overriden by the developer.
        */
        export enum NativeComponents {
            WebMVCConfigurer
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
        };

        /**
        * Refers to the context of the component inside the DI container.
        * When a request is made to the DI container, this is what the request returns.
        */
        export interface ComponentRegistryContext {
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
            type?: ComponentTypes;
            configuration?: any;
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
            get(componentName: string): ComponentRegistryContext | undefined;
            clearComponentRegistry(): void;
            update(itemName: string, newValue: ComponentRegistryContext | undefined): void;
            exist(itemName: string): boolean;
            getAllComponentNames(): Array<string>
            getAllComponentNamesByType(componentType: ComponentTypes): Array<string> | undefined
            getComponents(): ComponentRegistryContext[];
            getControllers(): ComponentRegistryContext[];
            getComponentsByComponentType(componentType: Mandarine.MandarineCore.ComponentTypes): Mandarine.MandarineCore.ComponentRegistryContext[];
            getComponentByHandlerType(classType: any): ComponentRegistryContext | undefined;
            resolveDependencies(): void;
            getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext | undefined;
            connectRepositoriesToProxy(): void;
            initializeControllers(): void;
        };

        /**
        * Refers to the templates' registry.
        * All the templates that are read and initialized at mandarine compile time are registed inside the templates registry
        * When an user requests a renderable endpoint, the templates' registry will get requested in order to get the template.
        */
        export interface ITemplatesManager {
            register(renderData: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, engine?: Mandarine.MandarineMVC.TemplateEngine.Engines): void;
            getTemplate(templatePath: Mandarine.MandarineMVC.TemplateEngine.Decorators.RenderData, manual: boolean): Mandarine.MandarineMVC.TemplateEngine.Template | undefined;
            getFullPath(templatePath: string): string;
            initializeTemplates(): void;
        }

        export class MandarineTemplateManager extends TemplatesManager {}

        /**
        * Refers to the resource handler registry.
        * All the resource handlers either initialized by the user or by Mandarine will be located here.
        */
        export interface IResourceHandlerRegistry {
            overriden: boolean;
            addResourceHandler(input: ResourceHandler): IResourceHandlerRegistry;
            getResourceHandlers(): Array<ResourceHandler>;
            getNew(): IResourceHandlerRegistry;
            freezeResourceHandlers(): void;
        }

        /**
        * Handlers the information of a resource handler that will be processed.
        */
        export interface IResourceHandler {
            resourceHandlerPath: Array<RegExp> | undefined;
            resourceHandlerLocations: Array<string> | undefined;
            resourceHandlerIndex: Array<string> | undefined;
            resourceResolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver | undefined;
            addResourceHandler(...resourceHandlerPath: Array<RegExp>): ResourceHandler;
            addResourceHandlerLocation(...resourceHandlerLocations: Array<string>): ResourceHandler;
            addResourceHandlerIndex(...resourceHandlerIndex: Array<string>): ResourceHandler;
            addResourceResolver(resolver: Mandarine.MandarineMVC.HTTPResolvers.ResourceResolver): ResourceHandler;
            addResourceCors(cors: Mandarine.MandarineMVC.CorsMiddlewareOption): ResourceHandler;
        };

        /**
         * Properties used by the native components registry.
         * This interface provides mandarine with the management of native components in the core.
         */
        export interface NativeComponentsProperties {
            key: NativeComponents;
            type: any;
            onOverride?: (output: any) => void;
            children: Array<{
                methodName: string;
                type: any;
                isReadonly?: boolean;
                providers?: Array<any>;
                onOverride?: (output: any) => void;
            }>
        };

        /**
         * List of necessary fields for a Native Component
         */
        export interface MandarineNativeComponent<T> {
            overriden?: boolean;
            onInitialization(): T;
        }

        /**
         * Class responsible for storing resource handlers
         */
        export class MandarineResourceHandlerRegistry extends ResourceHandlerRegistry {}

    };

    /**
    * Refers to the namespace of the Mandarine MVC module.
    * Inside this module, you can find everything that is related to the MVC Engine
    */
    export import MandarineMVC = MandarineMvc;

    /**
    * Refers to the namespace of the Mandarine Security module.
    * Inside this module, you can find everything that is related to the Security Engine, like Sessions.
    */
   export import Security = MandarineSecurity; 


    /**
     * Refers to the namespace of the Mandarine ORM Core
     * Inside this module, you can find everything related to `Mandarine Data` or `Mandarine ORM` which handles the logic behind databases
     */
   export import ORM = MandarineORM;

   /**
    * Refers to the namespace containing a list of classes that are used for Mandarine native objects.
    * Native objects/classes are used to alter the behavior of internal functionalities
    */
   export import Native = MandarineNative;

   /**
    * Refers to the namespace containing interfaces & modules that are not directly part of Mandarine's core
    */
   export import Miscellaneous = MandarineMiscellaneous;

    /**
     * Refers to the namespace of types & interface shortcuts used by Mandarine
     */
   export import Types = MandarineCommonInterfaces;

    /**
    * Contains the default information Mandarine needs to work.
    */
    export namespace Defaults {

        export const mandarinePropertiesFile = "./src/main/resources/properties.json";

        export const MandarineDefaultConfiguration: Properties = {
            mandarine: {
                server: {
                    host: "0.0.0.0",
                    port: 8080,
                    responseType: MandarineMVC.MediaTypes.TEXT_HTML
                },
                resources: {
                    staticFolder: "./src/main/resources/static",
                    staticRegExpPattern: "/(.*)"
                },
                templateEngine: {
                    path: "./src/main/resources/templates",
                    engine: "ejs"
                },
                authentication: {
                    expiration: (1 * 3600 * 1000), // ONE HOUR
                    cookie: {
                        httpOnly: false
                    }
                },
                security: {
                    cookiesSignKeys: ["HORSE", "MANDARINE", "CAT", "NORWAY", "ORANGE", "TIGER"]
                }
            }
        };

        export const MandarineDefaultInitialProperties: MandarineInitialProperties = {
            propertiesFilePath: undefined,
            denoEnv: {}
        }

        export const MandarineDefaultSessionContainer = (): MandarineSecurity.Sessions.SessionContainer & any => {
            return Mandarine.Global.getNativeComponentsRegistry().get(MandarineCore.NativeComponents.WebMVCConfigurer).getSessionContainer();
        };

        export const MandarineDefaultCorsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption = {
            origin: '*',
            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
            optionsSuccessStatus: 204
        }
    };
}

/**
 * The method below initializes what is needed for the Core to run.
 */
(() => {
    MandarineLoading();
    
    Mandarine.Global.getMandarineDotEnv();
    Mandarine.Global.initializeSecurityInternals();
    Mandarine.Global.initializeNativeComponents();
    Mandarine.Global.initializeMandarineGlobal();
    Mandarine.Global.getMandarineInitialProps();
    Mandarine.Global.getMandarineConfiguration();
    Mandarine.Global.getComponentsRegistry();
    Mandarine.Global.getEntityManager();
    Mandarine.Global.getTemplateManager();
    Mandarine.Global.getResourceHandlerRegistry();
    Mandarine.Global.initializeDefaultSessionContainer();
    Mandarine.Global.getSessionContainer();
    Mandarine.Global.initializeMiddleware();
})();