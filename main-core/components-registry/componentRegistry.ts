import { ComponentFactoryError } from "../../mvc-framework/core/exceptions/mandarine/componentFactoryError.ts";
import { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";
import { ServiceComponent } from "../components/service-component/serviceComponent.ts";
import { ConfigurationComponent } from "../components/configuration-component/configurationComponent.ts";
import { ComponentComponent } from "../components/component-component/componentComponent.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { MiddlewareComponent } from "../components/middleware-component/middlewareComponent.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";
import { RepositoryComponent } from "../components/repository-component/repositoryComponent.ts";
import { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { RepositoryProxy } from "../../orm-core/repository/repositoryProxy.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { Reflect } from "../reflectMetadata.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Log } from "../../logger/log.ts";
import { CommonUtils } from "../utils/commonUtils.ts";

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

    public getComponentDefinitionNames(componentType?: Mandarine.MandarineCore.ComponentTypes): Array<string> {
        if(componentType == (null || undefined)) return this.getAllComponentNames();
        else return this.getAllComponentNamesByType(componentType);
    }

    public isComponentHandlerTypeMatch(componentName: string, classType: any): boolean {
        let componentContext: Mandarine.MandarineCore.ComponentRegistryContext = this.get(componentName);
        if(componentContext.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) return componentContext.componentInstance instanceof classType;
        else {
            let classHandler = componentContext.componentInstance.getClassHandler();
            if(ReflectUtils.checkClassInitialized(classHandler)) classHandler = new classHandler();
            return classHandler instanceof classType;
        }
    }

    public getComponentByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getComponents().find(component => {
            let instance = undefined;
            if(component.componentType == Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT) {
                instance = component.componentInstance;
            }else {
                instance = component.componentInstance.getClassHandler();
            }
            if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();

            return instance instanceof classType;
        });
    }

    public getComponentType(componentName: string): string {
        let componentContext: Mandarine.MandarineCore.ComponentRegistryContext = this.get(componentName);
        switch(componentContext.componentType) {
            case Mandarine.MandarineCore.ComponentTypes.CONTROLLER:
                let component: ControllerComponent = <ControllerComponent> componentContext.componentInstance;
                return component.getClassHandler().constructor.name; 
            break;
        }
    }

    public resolveDependencies(): void {
        return DI.componentDependencyResolver(this);
    }

    private connectRepositoryToProxy(repositoryObject: Mandarine.MandarineCore.ComponentRegistryContext) {
        let repositoryInstance: RepositoryComponent = repositoryObject.componentInstance;
        let repositoryTarget: any = repositoryInstance.getClassHandler();
        let repositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(repositoryTarget);
        let mandarineRepositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(MandarineRepository);
        repositoryMethods = repositoryMethods.concat(mandarineRepositoryMethods);
        
        let repositoryProxy = new RepositoryProxy<any>(repositoryInstance.extraData.entity);

        repositoryMethods.forEach((methodName) => {

            if(ApplicationContext.getInstance().getEntityManager().getDataSource() == undefined) {
                repositoryTarget.prototype[methodName] = (...args) => {
                    this.logger.warn("A data source is required for repositories. Operation not supported");
                    return undefined;
                }
                return;
            }

            let methodParameterNames: Array<string> = ReflectUtils.getParamNames(repositoryTarget.prototype[methodName]);
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
                    break;
                case 'countAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.countAll();
                    }
                    return;
                    break;
                case 'deleteAll':
                    repositoryTarget.prototype[methodName] = () => {
                        return repositoryProxy.deleteAll();
                    }
                    return;
                    break;
                case 'save':
                    repositoryTarget.prototype[methodName] = (model) => {
                        return repositoryProxy.save(methodParameterNames, model);
                    }
                    return;
                    break;
            }

            if(methodName.startsWith('find')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "findBy", args);
                }
            } else if(methodName.startsWith('exists')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "existsBy", args);
                }
            } else if(methodName.startsWith('delete')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "deleteBy", args);
                }
            } else if(methodName.startsWith('count')) {
                repositoryTarget.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "countBy", args);
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
            this.update(`repo:${componentInstance.extraData.schema}.${componentInstance.extraData.table}`, repo);
        });

        if(repositoriesArray != undefined && repositoriesArray.length > 0) {
            this.logger.info(`A total of ${repositoriesArray.length} repositories have been found`);
        }
    }

    public getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getAllRepositories().find(repo => {
            let component: RepositoryComponent = repo.componentInstance;
            let instance = component.getClassHandler();
            if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();
            return instance instanceof classType;
        });
    }
}