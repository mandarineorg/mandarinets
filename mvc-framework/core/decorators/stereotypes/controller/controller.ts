// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../../../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../../../../main-core/Mandarine.ns.ts";
import { ReflectUtils } from "../../../../../main-core/utils/reflectUtils.ts";
import { ControllerComponent } from "../../../internal/components/routing/controllerContext.ts";
import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

/**
 * **Decorator**
 * 
 * Defines that a class is a controller. 
 * When a class is a controller, it is meant to resolve http handlers & all the internals related to mandarine HTTP server
 * 
 * `@Controller(baseRoute)
 *  Target: Class`
 */
export const Controller = (baseRoute?: string): Function => {
    return (target: any, methodName: string, index: number) => {
        let className: string = ReflectUtils.getClassName(target);
        let getComponentsRegistry = ApplicationContext.getInstance().getComponentsRegistry();
            if(getComponentsRegistry.exist(className)) {

                let objectContext: Mandarine.MandarineCore.ComponentRegistryContext = getComponentsRegistry.get(className);
                let controllerComponent:ControllerComponent = <ControllerComponent> objectContext.componentInstance;
                controllerComponent.setRoute(baseRoute);

                getComponentsRegistry.update(className, objectContext);
            } else {
                MVCDecoratorsProxy.registerControllerComponent(target, baseRoute);
            }
    };
};
