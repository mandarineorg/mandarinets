// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineORMException } from "../../orm-core/core/exceptions/mandarineORMException.ts";
import type { MandarineRepository } from "../../orm-core/repository/mandarineRepository.ts";
import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { ComponentExceptions } from "../exceptions/componentExceptions.ts";
import { InvalidAnnotationError } from "../exceptions/invalidAnnotationError.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineConstants } from "../mandarineConstants.ts";
import { Reflect } from "../reflectMetadata.ts";
import { ReflectUtils } from "../utils/reflectUtils.ts";

/**
* This class contains utils that are used in references related to the DI container
*/
export class ComponentsRegistryUtil {

    public static registerComponent(componentTarget: any, componentType: Mandarine.MandarineCore.ComponentTypes, configuration: any, index: number | null): any {
        if((index != null)) throw new InvalidAnnotationError(InvalidAnnotationError.CLASS_ONLY_ANNOTATION);
        
        let parentClassName: string = ReflectUtils.getClassName(componentTarget);
        let componentName = parentClassName;

        let componentsRegistry = ApplicationContext.getInstance().getComponentsRegistry();

        if(componentsRegistry.exist(componentName)) {
            throw new ComponentExceptions(ComponentExceptions.EXISTENT_COMPONENT.replace("%component%", componentName));
        } else {
            Reflect.defineMetadata(`${MandarineConstants.REFLECTION_MANDARINE_COMPONENT}:${Mandarine.MandarineCore.ComponentTypes[componentType].toLowerCase()}:${componentName}`, {
                componentName: componentName,
                componentConfiguration: configuration,
                componentType: componentType,
                componentInstance: componentTarget
            }, componentTarget);

            componentsRegistry.register(componentName, componentTarget, componentType, configuration);
        }
    }

    public static registerRepositoryComponent(repositoryTarget: any) {
        let mandarineRepository: object & MandarineRepository<any> = new repositoryTarget();
        let entity: Mandarine.ORM.Entity.Table | undefined = mandarineRepository.getModeler().entity;
        if(entity != (null || undefined)) {
            this.registerComponent(repositoryTarget, Mandarine.MandarineCore.ComponentTypes.REPOSITORY, {
                table: entity.tableName,
                schema: entity.schema,
                entity: entity
            }, null);
        } else {
            throw new MandarineORMException(MandarineORMException.INVALID_REPOSITORY, ReflectUtils.getClassName(repositoryTarget));
        }
    }
}