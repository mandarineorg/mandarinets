// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { ResourceHandler } from "../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { DenoAsserts, mockDecorator, Test } from "../mod.ts";
import { WebMVCConfigurer } from "../../main-core/mandarine-native/mvc/webMvcConfigurer.ts";
import { MandarineResourceResolver } from "../../main-core/mandarine-native/mvc/mandarineResourceResolver.ts"
import { MandarineSessionContainer } from "../../main-core/mandarine-native/sessions/mandarineSessionContainer.ts";
import { MandarineNative } from "../../main-core/Mandarine.native.ns.ts";
import { MandarineException } from "../../main-core/exceptions/mandarineException.ts";

export class NativeComponentTest {

    @Test({
        name: "Load WebMvcConfigurer",
        description: "Should load WebMvcConfigurer in native components registry"
    })
    public loadWebMvcConfigurer() {
        Mandarine.Global.initializeNativeComponents();

        const webMvcConfigurerNativeComponent = Mandarine.Global.getNativeComponentsRegistry().get(Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);

        const webMvcConfigurerNativeComponentResourceHandlers = webMvcConfigurerNativeComponent.addResourceHandlers();
        
        DenoAsserts.assertNotEquals(webMvcConfigurerNativeComponentResourceHandlers, undefined);
        DenoAsserts.assertEquals(webMvcConfigurerNativeComponentResourceHandlers.overriden, false);
        DenoAsserts.assertArrayContains(webMvcConfigurerNativeComponentResourceHandlers.resourceHandlers[0].resourceHandlerPath, [new RegExp("/(.*)")]);
        DenoAsserts.assertArrayContains(webMvcConfigurerNativeComponentResourceHandlers.resourceHandlers[0].resourceHandlerLocations, ["./src/main/resources/static"]);
        DenoAsserts.assert(webMvcConfigurerNativeComponent.getSessionContainer() instanceof MandarineSessionContainer);

    }

    @Test({
        name: "Override WebMvcConfigurer",
        description: "Should call proxy and override webMvcConfigurer -> addResourceHandlers"
    })
    public overrideWebMvcConfigurerResourceHandlers() {
        let mandarineResolver = new MandarineResourceResolver();

        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer{

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

        MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);
        const resourceHandlers = Mandarine.Global.getResourceHandlerRegistry().getResourceHandlers();

        DenoAsserts.assertEquals(resourceHandlers, [
            {
                resourceHandlerPath: [new RegExp("/docs/(.*)")],
                resourceHandlerLocations: ["./docs"],
                resourceResolver: mandarineResolver
            }
        ]);

        DenoAsserts.assert(resourceHandlers[0].resourceResolver instanceof MandarineResourceResolver);
        
        const overridenWebMvcConfigurer = Mandarine.Global.getNativeComponentsRegistry().get(Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);
        DenoAsserts.assertEquals(overridenWebMvcConfigurer.overriden, true);

    }

    @Test({
        name: "Override WebMvcConfigurer",
        description: "Call proxy and override sessionContainer"
    })
    public overrideWebMvcConfigurerSessionContainer() {
        Mandarine.Global.initializeNativeComponents();

        DenoAsserts.assertEquals(Mandarine.Global.getSessionContainer().sessionPrefix, "mandarine-session");
        
        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer {

            public getSessionContainer() {
                return new MandarineSessionContainer().set({ sessionPrefix: "override-session-container" });
            }

        }

        Mandarine.Global.initializeNativeComponents();

        MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);
        
        DenoAsserts.assertEquals(Mandarine.Global.getSessionContainer().sessionPrefix, "override-session-container");
    }

    @Test({
        name: "Do not override WebMvcConfigurer",
        description: "Should not override if its not being called from `Mandarine.Native`"
    })
    public dontOverrideIfItsnotPartOfNative() {
        Mandarine.Global.initializeNativeComponents();

        @mockDecorator()
        class FakeOverrideClass extends WebMVCConfigurer {

        }

        Mandarine.Global.initializeNativeComponents();

        DenoAsserts.assertThrows(() => {
            MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);
        }, MandarineException);
        
    }


}