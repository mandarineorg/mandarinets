import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MandarineTSFrameworkEngineMethods } from "../../main-core/engine/mandarineTSFrameworkEngineMethods.ts";
import { MandarineResourceResolver } from "../../main-core/mandarine-native/mvc/mandarineResourceResolver.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { DependencyInjectionDecoratorsProxy } from "../../main-core/proxys/dependencyInjectionDecorator.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { ResourceHandler } from "../../mvc-framework/core/internal/components/resource-handler-registry/resourceHandler.ts";
import { DenoAsserts, mockDecorator, Orange, Test } from "../mod.ts";

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

        class FakeConfigurationClass {
            @mockDecorator()
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
        DependencyInjectionDecoratorsProxy.registerInjectableDecorator(FakeConfigurationClass.prototype, "addResourceHandlers");
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(FakeConfigurationClass, Mandarine.MandarineCore.ComponentTypes.CONFIGURATION, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        MandarineTSFrameworkEngineMethods.initializeEngineMethods();
        const resourceHandlers = Mandarine.Global.getResourceHandlerRegistry().getResourceHandlers();
        DenoAsserts.assertEquals(resourceHandlers, [
            {
                resourceHandlerPath: [new RegExp("/docs/(.*)")],
                resourceHandlerLocations: ["./docs"],
                resourceResolver: mandarineResolver
            }
        ]);
        DenoAsserts.assert(resourceHandlers[0].resourceResolver instanceof MandarineResourceResolver);
    }

}