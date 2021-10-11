// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Authenticator } from "../../main-core/mandarine-native/security/authenticatorDefault.ts";
import { DenoAsserts, Orange, Test } from "../mod.ts";

export class TestLogger {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test logger as injectable",
        description: "Test that mandarine's logger is exposed"
    })
    public testLoggerInjectable() {
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        let logger: Log = ApplicationContext.getInstance().getDIFactory().getDependency(Log);
        DenoAsserts.assertNotEquals(logger, undefined);
        DenoAsserts.assertNotEquals(logger.info, undefined);
        logger.info("");
    }

    @Test({
        name: "Test authenticator as injectable",
        description: "Test that mandarine's authenticator is exposed"
    })
    public testAuthenticatorInjectable() {
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();

        let authenticator: Authenticator = ApplicationContext.getInstance().getDIFactory().getDependency(Authenticator);
        DenoAsserts.assertNotEquals(authenticator, undefined);
        DenoAsserts.assertNotEquals(authenticator.getAuthenticationId, undefined);
        DenoAsserts.assertNotEquals(authenticator.performAuthentication, undefined);
        DenoAsserts.assertNotEquals(authenticator.performHTTPAuthentication, undefined);
        DenoAsserts.assertNotEquals(authenticator.stopHTTPAuthentication, undefined);

        DenoAsserts.assertEquals(typeof authenticator.getAuthenticationId, 'function');
        DenoAsserts.assertEquals(typeof authenticator.performAuthentication, 'function');
        DenoAsserts.assertEquals(typeof authenticator.performHTTPAuthentication, 'function');
        DenoAsserts.assertEquals(typeof authenticator.stopHTTPAuthentication, 'function');
    }

}