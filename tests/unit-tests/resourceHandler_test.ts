// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MandarineTSFrameworkEngineMethods } from "../../main-core/engine/mandarineTSFrameworkEngineMethods.ts";
import { MandarineResourceResolver } from "../../main-core/mandarine-native/mvc/mandarineResourceResolver.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { DependencyInjectionDecoratorsProxy } from "../../main-core/proxys/dependencyInjectionDecorator.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { ResourceHandler } from "../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { DenoAsserts, mockDecorator, Orange, Test } from "../mod.ts";
import { MandarineNative } from "../../main-core/Mandarine.native.ns.ts";

export class ResourceHandlerTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test Resource Handlers",
        description: "Test the creation of multiple resource handlers"
    })
    public createResourceHandlers() {
        let mandarineResolver = new MandarineResourceResolver();

        @mockDecorator()
        class FakeConfigurationClass extends Mandarine.Native.WebMvcConfigurer {

            public addResourceHandlers() {
                let resourceHandlerRegistry = Mandarine.Global.getResourceHandlerRegistry().getNew();
                resourceHandlerRegistry.addResourceHandler(
                    new ResourceHandler()
                    .addResourceHandler(new RegExp("/docs/(.*)"))
                    .addResourceHandlerLocation("./docs")
                    .addResourceResolver(mandarineResolver)
                )
                return resourceHandlerRegistry;
            }
        }
        MainCoreDecoratorProxy.overrideNativeComponent(FakeConfigurationClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);
        const resourceHandlers = Mandarine.Global.getResourceHandlerRegistry().getResourceHandlers();

        DenoAsserts.assertEquals(resourceHandlers, [
            {
                resourceCors: undefined,
                resourceHandlerIndex: undefined,
                resourceHandlerPath: [new RegExp("/docs/(.*)")],
                resourceHandlerLocations: ["./docs"],
                resourceResolver: mandarineResolver
            }
        ]);
        DenoAsserts.assert(resourceHandlers[0].resourceResolver instanceof MandarineResourceResolver);
    }

}