// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { ApplicationContext } from "../../mod.ts";
import { DenoAsserts, Orange, Test } from "./../mod.ts";

export class CacheManager {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeAll: () => {
                    //@ts-ignore
                    Mandarine.Global.getMandarineGlobal().mandarineProperties = undefined;
                },
                beforeEach: () => {
                    //@ts-ignore
                    Mandarine.Global.getMandarineGlobal().mandarineProperties = undefined;
                },
                afterEach: () => {
                    DenoAsserts.assertEquals(Mandarine.Global.readConfigByDots("mandarine.server.host"), "127.0.0.1");
                    DenoAsserts.assertEquals(Mandarine.Global.readConfigByDots("mandarine.server.port"), 8080);
                    DenoAsserts.assertEquals(Mandarine.Global.readConfigByDots("mandarine.enabled"), true);
                    DenoAsserts.assertEquals(Mandarine.Global.readConfigByDots("mandarine.auth.data.config.username"), "andreespirela");
                }
            }
        })
    }

    @Test({
        name: "Test setConfiguration with JSON file"
    })
    public testSetConfigurationJSON() {
        Mandarine.Global.getMandarineConfiguration('./tests/unit-tests/files/jsonConf.json');
    }


    @Test({
        name: "Test setConfiguration with YAML file"
    })
    public testSetConfigurationYAML() {
        Mandarine.Global.getMandarineConfiguration('./tests/unit-tests/files/yamlConf.yaml');
    }

    @Test({
        name: "Test setConfiguration with properties file"
    })
    public testSetConfigurationProps() {
        Mandarine.Global.getMandarineConfiguration('./tests/unit-tests/files/props.properties');
    }

}