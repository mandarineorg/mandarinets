// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Log } from "../../logger/log.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
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

}