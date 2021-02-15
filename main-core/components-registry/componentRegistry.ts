// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { MongoDBService } from "../../orm-core/nosql/mongoDbService.ts";
import { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { MysqlRepositoryProxy } from "../../orm-core/repository/repositoryMysqlProxy.ts";
import { PostgresRepositoryProxy } from "../../orm-core/repository/repositoryPostgresProxy.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { RepositoryComponent } from "../components/repository-component/repositoryComponent.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { Authenticator } from "../mandarine-native/security/authenticatorDefault.ts";
import { WebSocketClientManager } from "../mandarine-native/websocket/websocketClientManager.ts";
import { WebSocketServerManager } from "../mandarine-native/websocket/websocketServerManager.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { CommonUtils } from "../utils/commonUtils.ts";
import { WebSocketClientUtil } from "../utils/components/websocketClient.ts";
import { WebSocketServerUtil } from "../utils/components/websocketServer.ts";
import { IndependentUtils } from "../utils/independentUtils.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";

/**
* This class is also known as the DI container.
* This class handles the addition, initialization and injection for all mandarine components
* This class is also responsible for connection repository methods to a repository proxy method in order to resolve queries
*/
export class ComponentsRegistry implements Mandarine.MandarineCore.IComponentsRegistry {

    private components: Map<string, Mandarine.MandarineCore.ComponentRegistryContext> = new Map<string, Mandarine.MandarineCore.ComponentRegistryContext>();

    private logger: Log = Log.getLogger(ComponentsRegistry);

    constructor() {
        this.components.set("MANDARINE_LOGGER", {
            componentName: "MANDARINE_LOGGER",
            componentInstance: new Log("-"),
            componentType: Mandarine.MandarineCore.ComponentTypes.INTERNAL
        });

        this.components.set("MANDARINE_AUTHENTICATOR", {
            componentName: "MANDARINE_AUTHENTICATOR",
            componentInstance: new Authenticator(),
            componentType: Mandarine.MandarineCore.ComponentTypes.INTERNAL
        });

        this.components.set("MANDARINE_WEBSOCKETSERVER_MANAGER", {
            componentName: "MANDARINE_WEBSOCKETSERVER_MANAGER",
            componentInstance: new WebSocketServerManager(),
            componentType: Mandarine.MandarineCore.ComponentTypes.INTERNAL
        });

        this.components.set("MANDARINE_WEBSOCKETCLIENT_MANAGER", {
            componentName: "MANDARINE_WEBSOCKETCLIENT_MANAGER",
            componentInstance: new WebSocketClientManager(),
            componentType: Mandarine.MandarineCore.ComponentTypes.INTERNAL
        });

        const mongoDbConnectionUrl: string | undefined = Mandarine.Global.readConfigByDots("mandarine.services.mongodb.connectionURL");
        if(mongoDbConnectionUrl) {
            
            this.components.set("MANDARINE_MONGODB_SERVICE", {
                componentName: "MANDARINE_MONGODB_SERVICE",
                componentInstance: new MongoDBService(mongoDbConnectionUrl),
                componentType: Mandarine.MandarineCore.ComponentTypes.INTERNAL
            });

            this.logger.info("MongoDB Service has been injected");
        }


    }

    public register(componentName: string, componentInstance: any, componentType: Mandarine.MandarineCore.ComponentTypes, configuration: any): void {
        let componentExist: boolean = this.exist(componentName);

        if(componentExist) {
            componentName = `${componentName}.${CommonUtils.generateUUID()}`;
        } else {

            let componentInstanceInitialized: any;
            let componentHandler: any = componentInstance;
            let isServiceType: boolean = false;

            switch(componentType) {
                case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                    componentInstanceInitialized = new ControllerComponent(componentName, configuration.pathRoute, componentInstance, componentHandler);
                    break;
                case Mandarine.MandarineCore.ComponentTypes.SERVICE:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.SERVICE);
                break;
                case Mandarine.MandarineCore.ComponentTypes.CONFIGURATION:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.CONFIGURATION);
                break;
                case Mandarine.MandarineCore.ComponentTypes.COMPONENT:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.COMPONENT);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE, configuration);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT:
                case Mandarine.MandarineCore.ComponentTypes.INTERNAL:
                    componentInstanceInitialized = componentInstance;
                break;
                case Mandarine.MandarineCore.ComponentTypes.REPOSITORY:
                    componentInstanceInitialized = new RepositoryComponent(componentName, componentHandler, configuration);
                break;
                case Mandarine.MandarineCore.ComponentTypes.CATCH:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.CATCH, configuration);
                break;
                case Mandarine.MandarineCore.ComponentTypes.GUARDS:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.GUARDS, configuration);
                break;
                case Mandarine.MandarineCore.ComponentTypes.WEBSOCKET:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler, Mandarine.MandarineCore.ComponentTypes.WEBSOCKET, configuration);
                break;
            }

            switch(componentType) {
                case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                case Mandarine.MandarineCore.ComponentTypes.SERVICE:
                case Mandarine.MandarineCore.ComponentTypes.CONFIGURATION:
                case Mandarine.MandarineCore.ComponentTypes.COMPONENT:
                case Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE:
                case Mandarine.MandarineCore.ComponentTypes.CATCH:  
                case Mandarine.MandarineCore.ComponentTypes.GUARDS:
                case Mandarine.MandarineCore.ComponentTypes.WEBSOCKET:
                    isServiceType = true;
                break;  
            }

            this.components.set(componentName, {
                componentName: componentName,
                componentInstance: componentInstanceInitialized,
                componentType: componentType,
                isServiceType: isServiceType
            });
        }
    }

    public get(itemName: string): Mandarine.MandarineCore.ComponentRegistryContext | undefined {
        return this.components.get(itemName);
    }

    public clearComponentRegistry(): void {
        const componentKeys = () => Array.from(this.components.keys());
        const toDelete = componentKeys().filter((componentKey: string) => {
            return this.components.get(componentKey)?.componentType != Mandarine.MandarineCore.ComponentTypes.INTERNAL;
        });
        toDelete.forEach((key: string) => this.components.delete(key));  
    }

    public update(itemName: string, newValue: Mandarine.MandarineCore.ComponentRegistryContext | undefined): void {
        if(newValue) {
            this.components.set(itemName, newValue);
        }
    }

    public exist(itemName: string): boolean {
        if(this.components.get(itemName) != null) return true;
        else return false;
    }

    public getAllComponentNames(): Array<string> {
        return Array.from(this.components.keys());
    }

    public getAllComponentNamesByType(componentType: Mandarine.MandarineCore.ComponentTypes): Array<string> | undefined {
        return Array.from(this.components.values()).filter(item => item.componentType == componentType).map(item => item.componentName || "");
    }

    public getComponents(): Mandarine.MandarineCore.ComponentRegistryContext[] {
        return Array.from(this.components.values());
    }

    public getComponentsByComponentType(componentType: Mandarine.MandarineCore.ComponentTypes): Mandarine.MandarineCore.ComponentRegistryContext[] {
        return Array.from(this.components.values()).filter(item => item.componentType == componentType);
    }

    public getControllers(): Mandarine.MandarineCore.ComponentRegistryContext[] {
        return Array.from(this.components.values()).filter(item => item.componentType == Mandarine.MandarineCore.ComponentTypes.CONTROLLER);
    }

    public getAllRepositories(): Array<Mandarine.MandarineCore.ComponentRegistryContext> {
        return this.getComponentsByComponentType(Mandarine.MandarineCore.ComponentTypes.REPOSITORY);
    }

    public getComponentByHandlerType(classType: any, requiredType?: Mandarine.MandarineCore.ComponentTypes): Mandarine.MandarineCore.ComponentRegistryContext | undefined {
        try {
            return this.getComponents().find((component: Mandarine.MandarineCore.ComponentRegistryContext) => {
                let instance = undefined;
                if(component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT || component.componentType == Mandarine.MandarineCore.ComponentTypes.INTERNAL) {
                    instance = component.componentInstance;
                }else {
                    instance = component.componentInstance.getClassHandler();
                }

                // This verification should never be called as instance may have parameters in its constructor. 
                // When this method is used, it should be used after initialization of dependencies
                if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();

                return instance instanceof classType && ((requiredType) ? (component.componentType == requiredType) : true);
            });
        } catch {
            return undefined;
        }
    }

    public resolveDependencies(): void {
        return DI.Factory.componentDependencyResolver(this);
    }

    public connectWebsocketClientProxy(websocketInstance: ComponentComponent): void {
        let websocketTarget: any = websocketInstance.getClassHandler();

        const metadataKeys: Array<string> = Reflect.getMetadataKeys(websocketTarget);
        metadataKeys.filter(item => item.startsWith(MandarineConstants.REFLECTION_MANDARINE_WEBSOCKET_PROPERTY)).forEach((item) => {
            const metadata: Mandarine.MandarineCore.Decorators.WebSocketProperty = Reflect.getMetadata(item, websocketTarget);
            if(metadata) {
                switch(metadata.property) {
                    case "onClose":
                        websocketInstance.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onclose = (event: CloseEvent) => {
                            websocketTarget[metadata.methodName](event);
                        }
                    break;
                    case "onOpen":
                        websocketInstance.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onopen = (event: Event) => {
                            websocketTarget[metadata.methodName](event);
                        }
                    break;
                    case "onMessage":
                        websocketInstance.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onmessage = (event: MessageEvent) => {
                            websocketTarget[metadata.methodName](event);
                        }
                    break;
                    case "onError":
                        websocketInstance.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onerror = (event: Event | ErrorEvent) => {
                            websocketTarget[metadata.methodName](event);
                        }
                    break;
                    case "send":
                        websocketTarget[metadata.methodName] = (data: string | ArrayBufferView | ArrayBuffer | Blob) => {
                            websocketInstance.getInternal<WebSocket>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).send(data);
                        }
                    break;
                    case "close":
                        websocketTarget[metadata.methodName] = (closeOptions?: { code?: number, reason?: string}) => {
                            WebSocketClientUtil.close(websocketInstance, closeOptions?.code, closeOptions?.reason);
                        }
                    break;
                }
            }
        });
    }

    public connectWebsocketServerProxy(websocketInstance: ComponentComponent): void {
        let websocketTarget: any = websocketInstance.getClassHandler();

        const metadataKeys: Array<string> = Reflect.getMetadataKeys(websocketTarget);
        metadataKeys.filter(item => item.startsWith(MandarineConstants.REFLECTION_MANDARINE_WEBSOCKET_PROPERTY)).forEach((item) => {
            const metadata: Mandarine.MandarineCore.Decorators.WebSocketProperty = Reflect.getMetadata(item, websocketTarget);
            if(metadata) {
                const internalExists: boolean = websocketInstance.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET) !== undefined;
                if(internalExists) {
                    switch(metadata.property) {
                        case "onMessage":
                            websocketInstance.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onmessage = (event: MessageEvent) => {
                                websocketTarget[metadata.methodName](event);
                            }
                        break;
                        case "onError":
                            websocketInstance.getInternal<Worker>(MandarineConstants.COMPONENT_PROPERTY_WEBSOCKET).onerror = (event: ErrorEvent) => {
                                event.preventDefault(); // Don't panic main thread since it should be handled already
                                websocketTarget[metadata.methodName](event);
                            }
                        break;
                        case "send":
                            throw new Error("Sending from WebSocket server to client is not implemented in Mandarine.");
                        case "close":
                            websocketTarget[metadata.methodName] = () => {
                                WebSocketServerUtil.unmount(websocketInstance);
                            }
                        break;
                    }
                } else {
                    this.logger.warn("An operation related to a websocket server was executed, but the worker for the server is not available.");
                }
            }
        });
    }

    private connectRepositoryToProxy(repositoryObject: Mandarine.MandarineCore.ComponentRegistryContext) {
        let repositoryInstance: RepositoryComponent = repositoryObject.componentInstance;
        let repositoryTarget: any = repositoryInstance.getClassHandler();
        let repositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(repositoryTarget);
        let mandarineRepositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(MandarineRepository);
        repositoryMethods = repositoryMethods.concat(mandarineRepositoryMethods);
        
        let repositoryProxy: Mandarine.ORM.RepositoryProxy;
        let dialect: Mandarine.ORM.Dialect.Dialects = Mandarine.Global.getMandarineConfiguration().mandarine?.dataSource?.dialect;
        
        if(dialect) {
            switch(dialect) {
                case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                    repositoryProxy = new PostgresRepositoryProxy<any>(repositoryInstance.extraData.entity);
                break;
                case Mandarine.ORM.Dialect.Dialects.MYSQL:
                    repositoryProxy = new MysqlRepositoryProxy<any>(repositoryInstance.extraData.entity);
                break;
                default:
                    throw new Error(`${dialect} is not supported inside Mandarine's ORM`);
            }
        }

        repositoryMethods.forEach((methodName) => {

            if(ApplicationContext.getInstance().getEntityManager().getDataSource() == undefined) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => {
                    this.logger.compiler("A data source is required for repositories. Operation not supported", "warn");
                    return undefined;
                }
                return;
            }

            let manualQuery: { query: string, secure?: boolean } = Reflect.getMetadata(`${MandarineConstants.REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY}:${methodName}`, new repositoryTarget(), methodName);
            
            if(manualQuery != undefined) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => {
                    return repositoryProxy.manualProxy(repositoryProxy, manualQuery.query, manualQuery.secure || false, args);
                }
                return;
            }

            switch(methodName) {
                case 'findAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.findAll(repositoryProxy);
                    }
                    return;
                case 'countAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.countAll(repositoryProxy);
                    }
                    return;
                case 'deleteAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.deleteAll(repositoryProxy);
                    }
                    return;
                case 'save':
                    repositoryTarget.prototype[methodName] = (model: any) => {
                        return repositoryProxy.save(model);
                    }
                    return;
            }

            if(methodName.startsWith('find')) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => { 
                    return repositoryProxy.mainProxy(repositoryProxy, methodName, "findBy", args);
                }
            } else if(methodName.startsWith('exists')) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => { 
                    return repositoryProxy.mainProxy(repositoryProxy, methodName, "existsBy", args);
                }
            } else if(methodName.startsWith('delete')) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => { 
                    return repositoryProxy.mainProxy(repositoryProxy, methodName, "deleteBy", args);
                }
            } else if(methodName.startsWith('count')) {
                repositoryTarget.prototype[methodName] = (...args: Array<any>) => { 
                    return repositoryProxy.mainProxy(repositoryProxy, methodName, "countBy", args);
                }
            }
        });

        repositoryInstance.classHandler = repositoryTarget;
        return repositoryInstance;
    }

    public connectRepositoriesToProxy(): void {
        let repositoriesArray = this.getAllRepositories();

        repositoriesArray.forEach((repo: Mandarine.MandarineCore.ComponentRegistryContext) => {
            const repoName = repo.componentName;
            if(!repoName) return;
            let componentInstance: RepositoryComponent = repo.componentInstance;
            let newRepositoryProxy: any = this.connectRepositoryToProxy(repo);
            let handler: any = newRepositoryProxy.getClassHandler();
            componentInstance.classHandler = new handler();
            this.update(repoName, repo);
        });

        if(ApplicationContext.CONTEXT_METADATA.engineMetadata?.orm) { 
            ApplicationContext.CONTEXT_METADATA.engineMetadata.orm.repositoriesAmount = repositoriesArray.length || 0;
        }
    }

    public getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext | undefined {
        return this.getAllRepositories().find((repo: Mandarine.MandarineCore.ComponentRegistryContext) => {
            let component: RepositoryComponent = repo.componentInstance;
            let instance = component.getClassHandler();
            if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();
            return instance instanceof classType;
        });
    }

    public initializeControllers(): void {
        this.getControllers().forEach((controller) => {
            (<ControllerComponent>controller.componentInstance).initializeControllerFunctionality();
        })
    }

    public initializeEventListeners(): void {
        const serviceTypeComponents = this.getComponents().filter((item) => item.isServiceType === true);
        serviceTypeComponents.forEach((component) => {
            const instance = component.componentInstance.getClassHandler();
            const metadataKeys: Array<string> = Reflect.getMetadataKeys(instance);

            metadataKeys.filter(item => item.startsWith(MandarineConstants.REFLECTION_MANDARINE_EVENTLISTENER_DECORATOR)).forEach((item) => {
                const metadata: Mandarine.MandarineCore.Decorators.EventListener = Reflect.getMetadata(item, instance);
                if(metadata) {
                    const isAsyncFunc = instance[metadata.methodName] instanceof Mandarine.AsyncFunction;
                    if(isAsyncFunc) {
                        addEventListener(metadata.eventName, async () => await instance[metadata.methodName]())
                    } else {
                        addEventListener(metadata.eventName, () => instance[metadata.methodName]())
                    }
                }
            });
        })
    }

    public initializeValueReaders(): void {
        const serviceTypeComponents = this.getComponents().filter((item) => item.isServiceType === true);
        serviceTypeComponents.forEach((component) => {
            const instances = [component.componentInstance.getClassHandler(), component.componentInstance.getClassHandlerPrimitive()];
            instances.forEach((instance) => {
                const metadataKeys: Array<string> = Reflect.getMetadataKeys(instance);

                metadataKeys.filter(item => item.startsWith(MandarineConstants.REFLECTION_MANDARINE_VALUE_DECORATOR)).forEach((item) => {
                    const metadata: Mandarine.MandarineCore.Decorators.Value = Reflect.getMetadata(item, instance);
                    if(metadata) {
                        let propertyObject = {};
                        if(metadata.scope == Mandarine.MandarineCore.ValueScopes.CONFIGURATION) propertyObject = Mandarine.Global.getMandarineConfiguration();
                        if(metadata.scope == Mandarine.MandarineCore.ValueScopes.ENVIRONMENTAL) propertyObject = Deno.env.toObject();
                        //onsole.log(propertyObject);
                        
                        if(!instance[metadata.propertyName]) {
                            instance[metadata.propertyName] = IndependentUtils.readConfigByDots(propertyObject, metadata.configKey);
                        }
                    }
                });
            });
        });
    }

    public initializeWebsocketComponents(): void {
        const websocketComponents = this.getComponentsByComponentType(Mandarine.MandarineCore.ComponentTypes.WEBSOCKET);
        websocketComponents.forEach((item) => {
            // Create Websocket
            let component: ComponentComponent = item.componentInstance;
            const { url, protocols, type, port } = component.configuration;

            try {
                if(type === "client") {
                    WebSocketClientUtil.mount(component, url, protocols);
                } else if(type === "server") {
                    WebSocketServerUtil.mount(component, port);
                }
            } catch(error) {
                if(type === "client") {
                    this.logger.warn(`Websocket client component could not establish a connnection with host ${url}. You may retry manually.`, error);
                } else if(type === "server") {
                    this.logger.warn(`Websocket server component could not be created in worker. `, error);
                }
            }
        })
    }
}