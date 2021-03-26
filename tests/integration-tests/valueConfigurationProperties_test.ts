// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class ValueConfigurationProperties {


    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test Endpoints from `files/customPropertiesAndValue.ts`",
        description: "Test all endpoints in file, and verifies that custom properties and value decorator are working fine"
    })
    public async testValueAndConfigurationProperties() {
        let cmd = await waitForMandarineServer("customPropertiesAndValue.ts");

        let test1 = (await (await fetch("http://localhost:7751/my-custom-config")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(test1, "ANY-DATABASE");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}