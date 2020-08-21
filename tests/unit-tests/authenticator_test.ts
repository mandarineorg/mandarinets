// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange, mockDecorator, MockCookies } from "../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { Cookies } from "../../deps.ts";
import { KeyStack } from "../../security-core/keyStack.ts";
import { Authenticator } from "../../main-core/mandarine-native/security/authenticatorDefault.ts";
import { handleBuiltinAuth } from "../../mvc-framework/core/middlewares/authMiddleware.ts";
import { MandarineConstants } from "../../main-core/mandarineConstants.ts";

export class AuthenticationTest {


    @Test({
        name: "Test authenticator",
        description: "Should test authenticator, and login, inject principal in request, then logout"
    })
    public async testAuthenticator() {

        let user = {
            roles: ["ANYROLE"],
            password: "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
            username: "test",
            uid: 1,
            accountExpired: false,
            accountLocked: false,
            credentialsExpired: false,
            enabled: true
        };

        @mockDecorator()
        class AuthManagerService  {

            public users = [Object.assign({}, user)];

            public loadUserByUsername(username) {
                return this.users.find((item) => item.username === username)
            }
        }

        ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry();
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(AuthManagerService, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        @mockDecorator()
        class FakeOverrideClass extends Mandarine.Native.WebMvcConfigurer{

            public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
                provider = provider.userDetailsService(AuthManagerService);
                return provider;
            }

        }

        Mandarine.Global.initializeNativeComponents();
        MainCoreDecoratorProxy.overrideNativeComponent(FakeOverrideClass, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);

        Mandarine.Global.initializeDefaultSessionContainer();
        Mandarine.Global.getSessionContainer().store.launch();

        let requestContext: { request: { headers: Headers }, response: { headers: Headers }, cookies: Cookies } = {
            request: {
                headers: new Headers()
            },
            response: {
                headers: new Headers()
            },
            cookies: undefined
        }

        requestContext.cookies = new Cookies(<any>requestContext.request, <any>requestContext.response, {
            keys: (<any>new KeyStack(["TEST"]))
        });

        const authenticator = new Authenticator();

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].password = "$2y$15$.rp/dnmo94FY9AgHHMLkH.YDdrDw/wUaUyNCdw62tdbMf7pWWrEqy";
        let authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Password is invalid",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_PASSWORD
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].password = user.password;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountExpired = true;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account has expired",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_EXPIRED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountExpired = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountLocked = true;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account is locked",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_LOCKED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountLocked = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].credentialsExpired = true;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Credentials are expired or are not valid",
            exception: Mandarine.Security.Auth.AuthExceptions.CREDENTIALS_EXPIRED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].credentialsExpired = false;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].enabled = false;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Account is currently disabled",
            exception: Mandarine.Security.Auth.AuthExceptions.ACCOUNT_DISABLED
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].enabled = true;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].roles = undefined;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: Roles in user are not valid inside Mandarine's context",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_ROLES
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].roles = user.roles;
        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].username = undefined;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "FAILED",
            message: "MandarineAuthenticationException: User does not exist",
            exception: Mandarine.Security.Auth.AuthExceptions.INVALID_USER
        });

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].username = user.username;

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "PASSED",
            message: "Success",
            authSesId: authenticate.authSesId
        });
        let toSetCookies = requestContext.response.headers.get("set-cookie");
        let processingCookies = toSetCookies.split(", MDAUTHID");
        let unsignedCookie = processingCookies[0].split("; path=/;")[0].split("=")[1];
        let signedCookie = processingCookies[1].split("; path=/;")[0].split("=")[1];

        requestContext.cookies = <any> new MockCookies();

        requestContext.cookies.set(MandarineConstants.SECURITY_AUTH_COOKIE_NAME, unsignedCookie);
        requestContext.cookies.set(MandarineConstants.SECURITY_AUTH_COOKIE_NAME + ".sig", signedCookie);

        authenticate = authenticator.performAuthentication("test", "Changeme1", <any>requestContext);

        DenoAsserts.assertEquals(authenticate, {
            status: "ALREADY-LOGGED-IN",
            authSesId: authenticate.authSesId
        });
        
        await handleBuiltinAuth()(<any>requestContext, () => {});

        DenoAsserts.assert((requestContext.request as any).authentication != undefined);
        DenoAsserts.assert((requestContext.request as any).authentication.AUTH_SES_ID != undefined);
        DenoAsserts.assert((requestContext.request as any).authentication.AUTH_EXPIRES != undefined);
        DenoAsserts.assert((requestContext.request as any).authentication.AUTH_PRINCIPAL != undefined);
        DenoAsserts.assertEquals((requestContext.request as any).authentication.AUTH_PRINCIPAL, user);

        authenticator.stopAuthentication(<any>requestContext);

        await handleBuiltinAuth()(<any>requestContext, () => {});

        DenoAsserts.assert((requestContext.request as any).authentication === undefined);

        Mandarine.Global.getSessionContainer().store.stopIntervals();
        Mandarine.Global.getSessionContainer().store = null;

    }

}