import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Authenticator } from "../../main-core/mandarine-native/security/authenticatorDefault.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts"
import { MainCoreDecoratorProxy } from "../../main-core/proxys/mainCoreDecorator.ts";
import { DenoAsserts, Orange, Test } from "../mod.ts";

export class AuthManagerService implements Mandarine.Security.Auth.UserDetailsService {

    public users = [{
        "roles":[],
        "password":"$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
        "username":"test",
        "uid":1,
        "accountExpired":true,
        "accountLocked":true,
        "credentialsExpired":true,
        "enabled":false
    }];

    public loadUserByUsername(username: any) {
        return this.users.find((item) => item.username === username)
    }
}

export class WebMvcConfigurer extends Mandarine.Native.WebMvcConfigurer {
    public authManagerBuilder(provider: Mandarine.Security.Auth.AuthenticationManagerBuilder) {
        provider = provider.userDetailsService(AuthManagerService);
        return provider;
    }
}

class AuthenticationTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test authentication service",
        description: "Should test all scenarios for built-in auth"
    })
    public testAuth() {
        Mandarine.Global.initializeNativeComponents();
        MainCoreDecoratorProxy.registerMandarinePoweredComponent(AuthManagerService, Mandarine.MandarineCore.ComponentTypes.SERVICE, {}, null);
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
        MainCoreDecoratorProxy.overrideNativeComponent(WebMvcConfigurer, Mandarine.MandarineCore.NativeComponents.WebMVCConfigurer);

        const authenticator: Authenticator = ApplicationContext.getInstance().getDIFactory().getDependency(Authenticator);
        const getUser = () => ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0];
        const [noUsernameResult, noUsernameUser] = authenticator.performAuthentication({
            username: <any> undefined,
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(noUsernameResult, {
            status: "FAILED",
            exception: "INVALID_USER",
            message: "MandarineAuthenticationException: User does not exist"
        });
        DenoAsserts.assertEquals(noUsernameUser, undefined);

        const [noPasswordResult, noPasswordUser] = authenticator.performAuthentication({
            username: "test",
            password: <any> undefined
        });
        
        DenoAsserts.assertEquals(noPasswordResult, {
            status: "FAILED",
            exception: "INVALID_PASSWORD",
            message: "MandarineAuthenticationException: Password is invalid"
        });
        DenoAsserts.assertEquals(noPasswordUser, undefined);

        const [invalidPasswordResult, invalidPasswordUser] = authenticator.performAuthentication({
            username: "test",
            password: "anypassword"
        });
        
        DenoAsserts.assertEquals(invalidPasswordResult, {
            status: "FAILED",
            exception: "INVALID_PASSWORD",
            message: "MandarineAuthenticationException: Password is invalid"
        });
        DenoAsserts.assertEquals(invalidPasswordUser, undefined);

        const [invalidRolesResult, invalidRolesUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(invalidRolesResult, {
            status: "FAILED",
            exception: "INVALID_ROLES",
            message: "MandarineAuthenticationException: Roles in user are not valid inside Mandarine's context"
        });
        DenoAsserts.assertEquals(invalidRolesUser, undefined);

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].roles = ["ADMIN", "MODERATOR"];

        const [accountExpiredResult, accountExpiredUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(accountExpiredResult, {
            status: "FAILED",
            exception: "ACCOUNT_EXPIRED",
            message: "MandarineAuthenticationException: Account has expired"
        });
        DenoAsserts.assertEquals(accountExpiredUser, undefined);

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountExpired = false;

        const [accountLockedResult, accountLockedUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(accountLockedResult, {
            status: "FAILED",
            exception: "ACCOUNT_LOCKED",
            message: "MandarineAuthenticationException: Account is locked"
        });
        DenoAsserts.assertEquals(accountLockedUser, undefined);

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].accountLocked = false;

        const [credentialsExpiredResult, credentialsExpiredUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(credentialsExpiredResult, {
            status: "FAILED",
            exception: "CREDENTIALS_EXPIRED",
            message: "MandarineAuthenticationException: Credentials are expired or are not valid"
        });
        DenoAsserts.assertEquals(credentialsExpiredUser, undefined);

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].credentialsExpired = false;

        const [enabledResult, enabledUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(enabledResult, {
            status: "FAILED",
            exception: "ACCOUNT_DISABLED",
            message: "MandarineAuthenticationException: Account is currently disabled"
        });
        DenoAsserts.assertEquals(enabledUser, undefined);

        ApplicationContext.getInstance().getDIFactory().getDependency(AuthManagerService).users[0].enabled = true;

        const [successResult, successUser] = authenticator.performAuthentication({
            username: "test",
            password: "Changeme1"
        });
        
        DenoAsserts.assertEquals(successResult, {
            status: "PASSED",
            message: "Success"
        });
        DenoAsserts.assertEquals(successUser, getUser());
    }

}