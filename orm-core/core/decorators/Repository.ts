// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ORMCoreDecoratorProxy } from "../proxys/ormCoreDecoratorProxy.ts";

/**
 * **Decorator**
 * 
 * Defines that an abstract class is a repository
 *
 * `@Repository()
 *  Target: Class`
 */
export const Repository = (): Function => {
    return (target: any) => {
        ORMCoreDecoratorProxy.registerComponentRepositoryDecorator(target)
    };
}

/**
 * **Decorator**
 * 
 * Defines that a repository method should not be resolved by MQL but it is a custom query and will be considered as such.
 *
 * `@CustomQuery(query, secure?)
 *  Target: Repository method`
 */
export const CustomQuery = (query: string, secure?: boolean): Function => {
    return (target: any, methodName: string) => {
        ORMCoreDecoratorProxy.registerCustomQueryDecorator(target, query, secure, methodName);
    }
}