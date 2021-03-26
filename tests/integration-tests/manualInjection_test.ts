// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class ManualInjectionTest {


    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT02] Test Endpoints from `files/manualInjection.ts`",
        description: "Test all endpoints in file, and verifies its return values"
    })
    public async testManualInjectionEndpoint() {
        let cmd = await waitForMandarineServer("manualInjection.ts");

        let testingManualInjection = (await (await fetch("http://localhost:8082/testing-manual-injection")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(testingManualInjection, "hello Andres");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}