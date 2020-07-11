// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { ORMCoreDecoratorProxy } from "../proxys/ormCoreDecoratorProxy.ts";

/**
 * **Decorator**
 * 
 * Defines that a class is an entity in Mandarine's ORM
 *
 * `@Table(decoratorOptions)
 *  Target: class`
 */
export const Table = (decoratorOptions: Mandarine.ORM.Entity.Decorators.Table): Function => {
    return (target: any) => {
        ORMCoreDecoratorProxy.registerTableDecorator(target, decoratorOptions);
    }
}

/**
 * **Decorator**
 * 
 * Defines that a property is a column in an entity.
 *
 * `@Column(decoratorOptions)
 *  Target: property`
 */
export const Column = (decoratorOptions?: Mandarine.ORM.Entity.Decorators.Column): Function => {
    return (target: any, propertyKey: string) => {
        ORMCoreDecoratorProxy.registerColumnDecorator(target, decoratorOptions, propertyKey);
    }
}

/**
 * **Decorator**
 * 
 * Defines that a column is a primary key
 *
 * `@Id()
 *  Target: property`
 */
export const Id = () => {
    return (target: any, propertyKey: string) => {
        ORMCoreDecoratorProxy.registerIdDecorator(target, propertyKey);
    }
}

/**
 * **Decorator**
 * 
 * Defines the generation strategy for a primary key
 *
 * `@GeneratedValue()
 *  Target: property`
 */
export const GeneratedValue = (decoratorOptions: Mandarine.ORM.Entity.Decorators.GeneratedValue) => {
    return (target: any, propertyKey: string) => {
        ORMCoreDecoratorProxy.registerGeneratedValueDecorator(target, decoratorOptions, propertyKey);
    }
}