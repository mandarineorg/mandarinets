// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { DependencyInjectionDecoratorsProxy } from "../../main-core/proxys/dependencyInjectionDecorator.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { DenoAsserts, mockDecorator, Orange, Test } from "../mod.ts";

export class DependencyInjectionTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test Component DI",
        description: "Test Dependency Injection through component creation"
    })
    public testComponentDI() {

        class MyDIClass {
            public pi(): number {
                return 3.14;
            }
        }

        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyDIClass, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyDIClass).pi(), 3.14);
    }

    @Test({
        name: "Test Component DI",
        description: "Test DI when an object is not injectable"
    })
    public testInvalidDI() {

        class MyNONInjectableClass {
            public pi(): number {
                return 3.14;
            }
        }

        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyNONInjectableClass), undefined);
    }

    @Test({
        name: "Test Multiple DI",
        description: "Test the injection of multiple components & one invalid"
    })
    public testMultipleComponentsDI() {

        class MyInvalidComponent {
        }

        @mockDecorator()
        class MyService3 {

            constructor(public readonly myInvalidComponent: MyInvalidComponent) {}

            public pi(): number {
                return 3.14;
            }
        }

        @mockDecorator()
        class MyService2 {
            constructor(public readonly myService3: MyService3) {}
        }

        @mockDecorator()
        class MyService1 {
            constructor(public readonly myService2: MyService2) {}
        }
        
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyService3, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyService2, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyService1, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);

        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        
        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyService1).myService2.myService3.pi(), 3.14);
        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyService1).myService2.myService3.myInvalidComponent, undefined);
    }

    @Test({
        name: "Test property DI",
        description: "Test the injection of a component through a property"
    })
    public testPropertyDI() {

        class MyComponent3 {

        }

        class MyComponent2 {

            public pi() {
                return 3.1415;
            }
        
        }

        class MyComponent1 {

            @mockDecorator()
            public propertyInjection: MyComponent2;

            @mockDecorator()
            public propertyInjectionInvalid: MyComponent3;

        }

        DependencyInjectionDecoratorsProxy.registerInject(MyComponent1.prototype, "propertyInjection", null);
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyComponent1, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, null);
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(MyComponent2, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, null);

        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyComponent1).propertyInjection.pi(), 3.1415);
        DenoAsserts.assertEquals(ApplicationContext.getInstance().getDIFactory().getDependency(MyComponent1).propertyInjectionInvalid, undefined);
    }   
}