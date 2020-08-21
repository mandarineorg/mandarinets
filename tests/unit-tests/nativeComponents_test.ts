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
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { BcryptEncoder } from "../../security-core/encoders/bcryptEncoder.ts";
import { LoginHandler } from "../../security-core/core/modules/loginHandler.ts";
import { MandarineSecurityException } from "../../main-core/exceptions/mandarineSecurityException.ts";

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


    @Test({
        name: "Override auth manager & login builder",
        description: "Should override authManagerBuilder & httpLoginBuilder"
    })
    public overrideAuthManagerBuilderAndHttpLoginBuilder() {

        @mockDecorator()
        class UserAuthService {
            public loadUserByUsername() {}
        }

        MainCoreDecoratorProxy.registerMandarinePoweredComponent(UserAuthService, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer{

            public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
                provider = provider.userDetailsService(UserAuthService);
                return provider;
            }

            public httpLoginBuilder(provider: Mandarine.Security.Core.Modules.LoginBuilder) {
                provider.loginPage("/pages/login")
                .loginProcessingUrl("/login-post")
                .loginSuccessUrl("/any-endpoint")
                .loginUsernameParameter("username")
                .loginPasswordParameter("password")
                .logoutUrl("/logout")
                .logoutSuccessUrl("/any-endpoint")
                return provider;
            }

        }

        Mandarine.Global.initializeNativeComponents();
        MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);

        const getAuthManagerBuilder = Mandarine.Global.getMandarineGlobal().__SECURITY__.auth.authManagerBuilder;
        const getHttpLoginBuilder = Mandarine.Global.getMandarineGlobal().__SECURITY__.auth.httpLoginBuilder;

        DenoAsserts.assert(getAuthManagerBuilder.getUserDetailsService() instanceof UserAuthService);
        DenoAsserts.assert(getAuthManagerBuilder.getPasswordEncoder() instanceof BcryptEncoder);
        DenoAsserts.assertEquals(getHttpLoginBuilder.login, {
            loginProcessingUrl: "/login-post",
            loginSucessUrl: "/any-endpoint",
            loginPage: "/pages/login",
            usernameParameter: "username",
            passwordParameter: "password",
            logoutUrl: "/logout",
            logoutSuccessUrl: "/any-endpoint",
            handler: new LoginHandler()
        });
    }

    @Test({
        name: "Try to override authManagerBuilder->userDetailsService",
        description: "Should throw an error when passing a invalid implementation"
    })
    public invalidUserDetailsImpl() {

        @mockDecorator()
        class UserAuthServiceSecond {
        }

        MainCoreDecoratorProxy.registerMandarinePoweredComponent(UserAuthServiceSecond, Mandarine.MandarineCore.ComponentTypes.COMPONENT, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry();
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer{

            public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
                provider = provider.userDetailsService(UserAuthServiceSecond);
                return provider;
            }

        }

        Mandarine.Global.initializeNativeComponents();
        DenoAsserts.assertThrows(() => MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer), MandarineSecurityException);
    }


}