// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../application-context/mandarineApplicationContext.ts";
import { DI } from "../dependency-injection/di.ns.ts";
import { DependencyInjectionUtil } from "../dependency-injection/di.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class DependencyInjectionDecoratorsProxy {

    public static registerInject(targetClass: any, propertyName: string, propertyInMethodIndex: number) {
        DependencyInjectionUtil.defineInjectionMetadata(DI.InjectionTypes.INJECTABLE_OBJECT, targetClass, propertyName, propertyInMethodIndex);
    }

    public static registerInjectableDecorator(targetClass: any, methodName: string) {
        let componentExist: boolean = ApplicationContext.getInstance().getComponentsRegistry().exist(methodName);

        if(!componentExist) {
            ApplicationContext.getInstance().getComponentsRegistry().register(methodName, targetClass[methodName](), Mandarine.MandarineCore.ComponentTypes.MANUAL_COMPONENT, {});
        }
    }

}