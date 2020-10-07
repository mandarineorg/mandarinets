// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { MandarineConstants } from "../../main-core/mandarineConstants.ts";
import { MandarineCore } from "../../main-core/mandarineCore.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Test } from "./../mod.ts";

export class CoreTest {

    @Test({
        name: "Freeze project properties",
        description: "Mandarine properties should be frozen when invoking core"
    })
    public async checkCopyright() {

        Mandarine;
        new MandarineCore();

        DenoAsserts.assertThrows(() => {
            Mandarine.Global.getMandarineGlobal().mandarineProperties.mandarine.security.cookiesSignKeys.push("Error");
        }, TypeError, "object is not extensible");

        DenoAsserts.assertThrows(() => {
            Mandarine.Global.getMandarineGlobal().mandarineProperties.mandarine.server.host = "Fakehost";
        }, TypeError, "Cannot assign to read only property 'host' of object '#<Object>'");

        DenoAsserts.assertEquals(Mandarine.Global.getMandarineGlobal().mandarineProperties.mandarine.server.host, Mandarine.Defaults.MandarineDefaultConfiguration.mandarine.server.host);
    }

}