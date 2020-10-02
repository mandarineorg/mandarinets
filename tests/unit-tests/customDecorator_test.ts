// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MVCDecoratorsProxy } from "../../mvc-framework/core/proxys/mvcCoreDecorators.ts";
import { DI } from "../../main-core/dependency-injection/di.ns.ts";
import { parameterDecoratorFactory } from "../../mvc-framework/core/decorators/custom-decorators/decoratorsFactory.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import type { ControllerComponent } from "../../mvc-framework/core/internal/components/routing/controllerContext.ts";

export class CustomDecoratorTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => {
                    ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry();
                }
            }
        })
    }

    @Test({
        name: "Test Custom Decorator Metadata",
        description: "Verify that custom decorator adds a provider and data to the metadata"
    })
    public async testCustomDecorator() {
        const myCustomDecorator = parameterDecoratorFactory((context, parameter) => {
            return parameter;
        });

        @mockDecorator()
        class MyCustomDecoratorController {
            
            @mockDecorator()
            public getRoute(@myCustomDecorator('Juan') customDecoratorParam: any) {
            }

        }
        
        MVCDecoratorsProxy.registerHttpAction("/api-custom-decorator-test", Mandarine.MandarineMVC.HttpMethods.GET, MyCustomDecoratorController.prototype, "getRoute", <any><unknown>undefined);
        MVCDecoratorsProxy.registerControllerComponent(MyCustomDecoratorController, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyCustomDecoratorController")?.componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));
        if(!action) throw new Error();
        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get-2?name=testing&framework=Mandarine")
            }
        });
        DenoAsserts.assertEquals(args, ["Juan"]);
    }

    @Test({
        name: "Test Custom Decorator Metadata",
        description: "Verify that custom decorator adds a provider and data to the metadata (MANUAL)"
    })
    public async testCustomDecoratorThroughManualMetadata() {
        @mockDecorator()
        class MyCustomDecoratorController2 {
            
            @mockDecorator()
            public getRoute(customDecoratorParam: any) {
            }

        }
        
        MVCDecoratorsProxy.registerHttpAction("/api-custom-decorator-test-2", Mandarine.MandarineMVC.HttpMethods.GET, MyCustomDecoratorController2.prototype, "getRoute", <any><unknown>undefined);
        MVCDecoratorsProxy.registerRoutingParam(MyCustomDecoratorController2.prototype, DI.InjectionTypes.CUSTOM_DECORATOR_PARAM, "getRoute", 0, "customDecoratorParam", {
            provider: (context: any, data: any) => data,
            paramData: ["Juan"]
        });
        MVCDecoratorsProxy.registerControllerComponent(MyCustomDecoratorController2, undefined);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
        let controller: ControllerComponent = ApplicationContext.getInstance().getComponentsRegistry().get("MyCustomDecoratorController2")?.componentInstance;
        let actions: Map<String, Mandarine.MandarineMVC.Routing.RoutingAction> = controller.getActions();
        let action = actions.get(controller.getActionName("getRoute"));
        if(!action) throw new Error();
        let args = await DI.Factory.methodArgumentResolver(controller.getClassHandler(), action.actionMethodName, <any> {
            request: {
                url: new URL("http://localhost/api-get-2?name=testing&framework=Mandarine")
            }
        });
        DenoAsserts.assertEquals(args, ["Juan"]);
    }
}