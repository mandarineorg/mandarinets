// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { PostgresRepositoryProxy } from "../../orm-core/repository/repositoryPostgresProxy.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { MiddlewareComponent } from "../components/middleware-component/middlewareComponent.ts";
import { RepositoryComponent } from "../components/repository-component/repositoryComponent.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { CommonUtils } from "../utils/commonUtils.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";

/**
* This class is also known as the DI container.
* This class handles the addition, initialization and injection for all mandarine components
* This class is also responsible for connection repository methods to a repository proxy method in order to resolve queries
*/
export class ComponentsRegistry implements Mandarine.MandarineCore.IComponentsRegistry {

    private components: Map<string, Mandarine.MandarineCore.ComponentRegistryContext> = new Map<string, Mandarine.MandarineCore.ComponentRegistryContext>();

    private logger: Log = Log.getLogger(ComponentsRegistry);

    public register(componentName: string, componentInstance: any, componentType: Mandarine.MandarineCore.ComponentTypes, configuration: any): void {
        let componentExist: boolean = this.exist(componentName);

        if(componentExist) {
            componentName = `${componentName}.${CommonUtils.generateUUID()}`;
        } else {

            let componentInstanceInitialized: any;
            let componentHandler: any = componentInstance;

            switch(componentType) {
                case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                    componentInstanceInitialized = new ControllerComponent(componentName, configuration.pathRoute, componentInstance, componentHandler);
                    break;
                case Mandarine.MandarineCore.ComponentTypes.SERVICE:
                    componentInstanceInitialized = new ServiceComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.CONFIGURATION:
                    componentInstanceInitialized = new ConfigurationComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.COMPONENT:
                    componentInstanceInitialized = new ComponentComponent(componentName, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MIDDLEWARE:
                    componentInstanceInitialized = new MiddlewareComponent(componentName, configuration.regexRoute, componentHandler);
                break;
                case Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT:
                    componentInstanceInitialized = componentInstance;
                break;
                case Mandarine.MandarineCore.ComponentTypes.REPOSITORY:
                    componentInstanceInitialized = new RepositoryComponent(componentName, componentHandler, configuration);
                break;
            }

            this.components.set(componentName, {
                classParentName: componentName,
                componentName: componentName,
                componentInstance: componentInstanceInitialized,
                componentType: componentType
            });
        }
    }

    public get(itemName: string): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.components.get(itemName);
    }

    public clearComponentRegistry(): void {
        this.components.clear();
    }

    public update(itemName: string, newValue: Mandarine.MandarineCore.ComponentRegistryContext): void {
        this.components.set(itemName, newValue);
    }

    public exist(itemName: string): boolean {
        if(this.components.get(itemName) != null) return true;
        else return false;
    }

    public getAllComponentNames(): Array<string> {
        return Array.from(this.components.keys());
    }

    public getAllComponentNamesByType(componentType: Mandarine.MandarineCore.ComponentTypes): Array<string> {
        return Array.from(this.components.values()).filter(item => item.componentType == componentType).map(item => item.componentName);
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

    public getComponentByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getComponents().find(component => {
            let instance = undefined;
            if(component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) {
                instance = component.componentInstance;
            }else {
                instance = component.componentInstance.getClassHandler();
            }

            // This verification should never be called as instance may have parameters in its constructor. 
            // When this method is used, it should be used after initialization of dependencies
            if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();

            return instance instanceof classType;
        });
    }

    public resolveDependencies(): void {
        return DI.Factory.componentDependencyResolver(this);
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
                default:
                    throw new Error(`${dialect} is not supported inside Mandarine's ORM`);
            }
        }

        repositoryMethods.forEach((methodName) => {

            if(ApplicationContext.getInstance().getEntityManager().getDataSource() == undefined) {
                repositoryTarget.prototype[methodName] = (...args) => {
                    this.logger.compiler("A data source is required for repositories. Operation not supported", "warn");
                    return undefined;
                }
                return;
            }

            let manualQuery: { query: string, secure?: boolean } = Reflect.getMetadata(`${MandarineConstants.REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY}:${methodName}`, new repositoryTarget(), methodName);
            
            if(manualQuery != undefined) {
                repositoryTarget.prototype[methodName] = (...args) => {
                    return repositoryProxy.manualProxy(manualQuery.query, manualQuery.secure, args);
                }
                return;
            }

            switch(methodName) {
                case 'findAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.findAll();
                    }
                    return;
                case 'countAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.countAll();
                    }
                    return;
                case 'deleteAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.deleteAll();
                    }
                    return;
                case 'save':
                    repositoryTarget.prototype[methodName] = (model) => {
                        return repositoryProxy.save(model);
                    }
                    return;
            }

            if(methodName.startsWith('find')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, "findBy", args);
                }
            } else if(methodName.startsWith('exists')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, "existsBy", args);
                }
            } else if(methodName.startsWith('delete')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, "deleteBy", args);
                }
            } else if(methodName.startsWith('count')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, "countBy", args);
                }
            }
        });

        repositoryInstance.classHandler = repositoryTarget;
        return repositoryInstance;
    }

    public connectRepositoriesToProxy(): void {
        let repositoriesArray = this.getAllRepositories();

        repositoriesArray.forEach((repo: Mandarine.MandarineCore.ComponentRegistryContext) => {
            let componentInstance: RepositoryComponent = repo.componentInstance;
            let newRepositoryProxy: any = this.connectRepositoryToProxy(repo);
            let handler: any = newRepositoryProxy.getClassHandler();
            componentInstance.classHandler = new handler();
            this.update(repo.componentName, repo);
        });

        ApplicationContext.CONTEXT_METADATA.engineMetadata.orm.repositoriesAmount = repositoriesArray.length;
    }

    public getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getAllRepositories().find(repo => {
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
}