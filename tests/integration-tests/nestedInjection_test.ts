// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class NestedInjectionTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT03] Test Endpoints from `files/nestedInjection.ts`",
        description: "Test all endpoints in file, and verifies its return values"
    })
    public async testPiInService() {
        let cmd = await waitForMandarineServer("nestedInjections.ts");

        let testingManualInjection = (await (await fetch("http://localhost:8083/test")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(testingManualInjection, "3.14");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}