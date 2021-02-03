// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class ManualInjectionTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

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
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/manualInjection.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

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