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
import { Leaf } from "../deps.ts";
import { IndependentUtils } from "./utils/independentUtils.ts";
import { ClassType } from "./utils/utilTypes.ts";
import { Microlemon }  from "./microservices/mod.ts";
import { MicroserviceManager } from "./microservices/microserviceManager.ts";
import { MandarineCoreTimers } from "./internals/core/mandarineCoreTimers.ts";
import { MandarineConstants } from "./mandarineConstants.ts";
import { YamlUtils } from "./utils/yamlUtils.ts";
import { PropertiesUtils } from "./utils/propertiesUtils.ts";

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
                responseType?: MandarineMVC.MediaTypes,
                responseTimeHeader?: boolean
                enableSessions?: boolean,
                enableCors?: boolean,
                https?: {
                    certFile: string,
                    keyFile: string
                },
                cache?: {
                    enabled: boolean,
                    defaultExpiration: number,
                    expirationInterval: number
                }
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
            sessions: {
                touch: boolean,
                expiration: number,
                expirationInterval: number
            },
            security?: {
                cookiesSignKeys: Array<string>
            },
            services?: {
                mongodb?: {
                    connectionURL: string;
                }
            },
            microservices?: {
                automaticHealthCheck?: boolean;
                automaticHealthCheckInterval?: number;
                [transporter: string]: Microlemon.ConnectionData | any;
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
            mandarineMicroserviceManager: MandarineCore.IMicroserviceManager;
            __SECURITY__: {
                auth: {
                    authManagerBuilder: MandarineSecurity.Auth.AuthenticationManagerBuilder,
                    httpLoginBuilder: MandarineSecurity.Core.Modules.LoginBuilder
                }
            },
            internalProps: Map<string, any>
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
                    mandarineMicroserviceManager: undefined,
                    __SECURITY__: {
                        auth: {
                            authManagerBuilder: undefined
                        }
                    },
                    internalProps: new Map()
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
        * Get the microservice manager
        */
       export function getMicroserviceManager(): Mandarine.MandarineCore.IMicroserviceManager { 
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.mandarineMicroserviceManager == (null || undefined)) {
                mandarineGlobal.mandarineMicroserviceManager = new Mandarine.MandarineCore.MandarineMicroserviceManager();
            }

            return mandarineGlobal.mandarineMicroserviceManager;
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
        export function getMandarineConfiguration(configPath?: string): Properties {
            let mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();
            if(!mandarineGlobal.mandarineProperties) {
                try {
                    const initialProperties: MandarineInitialProperties | undefined = getMandarineInitialProps();
                    let mandarinePropertiesFile = configPath || Deno.env.get(MandarineEnvironmentalConstants.MANDARINE_PROPERTY_FILE) || initialProperties?.propertiesFilePath || Defaults.mandarinePropertiesFile;
                    let fileExtOpts = mandarinePropertiesFile.split(".");
                    let fileExt = fileExtOpts[fileExtOpts.length - 1].toLowerCase();

                    let propertiesData: any;
                    logger.debug(`Using configuration with type: ${fileExt}`);
                    if(fileExt === "json") {
                        propertiesData = JsonUtils.toJson(mandarinePropertiesFile, { isFile: true, allowEnvironmentalReferences: true });
                    } else if(fileExt === "yaml" || fileExt === "yml") {
                        const yamlContent = JSON.stringify(YamlUtils.yamlFileToJS(mandarinePropertiesFile));
                        propertiesData = JsonUtils.toJson(yamlContent, { isFile: false, allowEnvironmentalReferences: true });
                    } else if(fileExt === "properties") {
                        const propertiesContent = JSON.stringify(PropertiesUtils.propertiesToJS(mandarinePropertiesFile));
                        propertiesData = JsonUtils.toJson(propertiesContent, { isFile: false, allowEnvironmentalReferences: true });
                    }

                    setConfiguration(propertiesData);
                } catch(error) {
                    mandarineGlobal.mandarineProperties = Defaults.MandarineDefaultConfiguration;
                    logger.warn(`properties.json could not be found or parsed. Using default values. `);
                    logger.debug(`Properties file: ${configPath}`);
                    logger.debug(`Properties reading error ${error.message}`)
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
                const coreProps = Mandarine.Global.getInternalProps();
                if(CommonUtils.fileDirExists('./.env')) {
                    if(!coreProps.has(MandarineConstants.DOT_ENV_LOADED)) {
                        const environmentVariablesString = CommonUtils.readFile('./.env');
                        const enviromentVariables = MandarineUtils.parseConfigurationFile(environmentVariablesString);
                        Object.keys(enviromentVariables).forEach((key) => Deno.env.set(key, enviromentVariables[key]));
                        coreProps.set(MandarineConstants.DOT_ENV_LOADED, true);
                    }
                } else {
                    compilerAlert();
                }
            } catch (error) {
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

            properties = IndependentUtils.setDefaultValues(properties, defaultConfiguration);
            
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

        export function getInternalProps(): Map<string, any> {
            const mandarineGlobal: MandarineGlobalInterface = getMandarineGlobal();

            if(mandarineGlobal.internalProps == (undefined || null)) {
                mandarineGlobal.internalProps = new Map();
            }

            return mandarineGlobal.internalProps;
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

        /**
         * Read Mandarine's configuration by dots
         */
        export function readConfigByDots(key: string) {
            return IndependentUtils.readConfigByDots(getMandarineConfiguration(), key);
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
            getMicroserviceManager(): Mandarine.MandarineCore.IMicroserviceManager;
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

        export namespace Internals {

            export type CoreTimersType = "Timeout" | "Interval";
            export interface CoreTimers {
                timerId: number;
                key: string;
                type: CoreTimersType
            }

            export const getTimersManager = () => {
                return MandarineCoreTimers.getInstance();
            }

            export const getEnv = (env: string) => {
                Mandarine.Global.getMandarineDotEnv();

                return Deno.env.get(env);
            }

        }

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
            GUARDS,
            INTERNAL,
            WEBSOCKET,
            MICROSERVICE
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
         * Context for Tasks that are timer-like.
         */
        export interface TimerMetadataContext {
            handlerType: ClassType;
            methodName: string;
            fixedRate: number;
            interval: number;
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
            isServiceType?: boolean;
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
            getComponentByHandlerType(classType: any, requiredType?: Mandarine.MandarineCore.ComponentTypes): ComponentRegistryContext | undefined;
            resolveDependencies(): void;
            getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext | undefined;
            connectRepositoriesToProxy(): void;
            initializeControllers(): void;
            initializeEventListeners(): void;
            initializeValueReaders(): void;
            initializeWebsocketComponents(): void;
            connectWebsocketClientProxy(component: any): void;
            connectWebsocketServerProxy(component: any): void;
            initializeTasks(): void;
            initializeMicroservices(): void;
            connectMicroserviceToProxy(microserviceInstance: ComponentComponent): void;
            initializeValueReaderWithCustomConfiguration(): void;
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
         * 
         */
        export interface IMicroserviceManager {
            create(componentPrimitive: ClassType, configuration: Microlemon.ConnectionData): Promise<[boolean, Mandarine.MandarineCore.MicroserviceItem]>;
            getByComponent(component: ComponentComponent): Mandarine.MandarineCore.MicroserviceItem | undefined;
            deleteByHash(hash: string): void;
            enableAutomaticHealthInterval(): void;
            getMicroservices(): Array<Mandarine.MandarineCore.MicroserviceItem>;
            disableAutomaticHealthInterval(): void;
            enableAutomaticHealthInterval(): void;
            isHealthy(hash: string): Promise<boolean>;
            getByHash(hash: string): Mandarine.MandarineCore.MicroserviceItem | undefined;
            getByMicroservice(microservice: Mandarine.MandarineCore.MicroserviceItem): Mandarine.MandarineCore.MicroserviceItem | undefined;
            deleteByMicroservice(microservice: Mandarine.MandarineCore.MicroserviceItem): void;
            isHealthyByMicroservice(microservice: Mandarine.MandarineCore.MicroserviceItem): Promise<boolean>;
            remountFromExistent(microservice: Mandarine.MandarineCore.MicroserviceItem): Promise<void>;
        }

        export class MandarineMicroserviceManager extends MicroserviceManager {}

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

        /**
         * Core Decorators
         */
        export namespace Decorators {
            export interface EventListener {
                eventName: string,
                methodName: string
            }
            export interface Value {
                configKey: string,
                scope: ValueScopes | undefined,
                propertyName: string
            }

            export type WebSocketValidProperties =  "onClose" | "onOpen" | "onError" | "onMessage" | "send" | "close" | "onMessageError";
            export interface WebSocketProperty {
                property: WebSocketValidProperties,
                methodName: string
            }

            export interface ScheduledTask {
                methodName: string,
                cronExpression: string,
                timeZone: string | undefined
            }
            export interface Timer {
                fixedRate: number,
                methodName: string
            }

            export type MicroserviceWorkerProperties = "onOpen" | "onClose" | "onError" | "onMessage" | "close";
            export interface MicroserviceProperty {
                property: MicroserviceWorkerProperties,
                methodName: string
            }
        }

        export type MicroserviceStatus = "Initialized" | "Initialized,Listening" | "Unhealthy";
        export interface MicroserviceItem {
            worker: Worker;
            createdDate: Date;
            lastMountingDate: Date;
            status: MicroserviceStatus;
            parentComponent: ClassType;
            microserviceConfiguration: Microlemon.ConnectionData;
            hash: string;
        }

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
                    host: Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_HOST) || "0.0.0.0",
                    port: parseInt(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_PORT) || "8080"),
                    responseType: MandarineMVC.MediaTypes.TEXT_HTML,
                    responseTimeHeader: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_RESPONSE_TIME_HEADER) || "false"),
                    enableSessions: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_SESSION_MIDDLEWARE) || "true"),
                    enableCors: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_CORS_MIDDLEWARE) || "true"),
                    cache: {
                        enabled: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SERVER_CACHE_ENABLED) || "true"),
                        defaultExpiration: (60 * 1000) * 60,
                        expirationInterval: (60 * 60 * 1000)
                    }
                },
                resources: {
                    staticFolder: Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_STATIC_CONTENT_FOLDER) || "./src/main/resources/static",
                    staticRegExpPattern: "/(.*)"
                },
                templateEngine: {
                    path: "./src/main/resources/templates",
                    engine: "ejs"
                },
                authentication: {
                    expiration: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_AUTH_EXPIRATION_MS) || (1 * 3600 * 1000).toString()), // ONE HOUR
                    cookie: {
                        httpOnly: false
                    }
                },
                sessions: {
                    touch: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SESSIONS_TOUCH) || "true"),
                    expiration: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SESSIONS_EXPIRATION_TIME) || (1000 * 60 * 60 * 24).toString()),
                    expirationInterval: CommonUtils.parseToKnownType(Mandarine.MandarineCore.Internals.getEnv(MandarineEnvironmentalConstants.MANDARINE_SESSIONS_EXPIRATION_INTERVAL) || (1000 * 60 * 60).toString())
                },
                security: {
                    cookiesSignKeys: ["HORSE", "MANDARINE", "CAT", "NORWAY", "ORANGE", "TIGER"]
                },
                microservices: {
                    automaticHealthCheck: true,
                    automaticHealthCheckInterval: (30 * 1000)
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

    /**
     * Mandarine File System
     */

    export const readFile = Leaf.readFile;
    export const readFileSync = Leaf.readFileSync;
    export const readTextFile = Leaf.readTextFile;
    export const readTextFileSync = Leaf.readTextFileSync;

     /**
      * End File System
      */

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
    Mandarine.Global.getMandarineInitialProps(); // Reads `mandarine.json`
    Mandarine.Global.getMandarineConfiguration(); // Sets configuration by file. If Configuration is set programatically, it will be overriden
    Mandarine.Global.getComponentsRegistry();
    Mandarine.Global.getEntityManager();
    Mandarine.Global.getTemplateManager();
    Mandarine.Global.getResourceHandlerRegistry();
    Mandarine.Global.initializeDefaultSessionContainer();
    Mandarine.Global.getSessionContainer();
    Mandarine.Global.initializeMiddleware();
})();