// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class PipeTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 55;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test Endpoints from `files/pipes.ts`",
        description: "Test all endpoints in file, and verifies that transformation from pipe is working fine"
    })
    public async testManualInjectionEndpoint() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/pipes.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let test1 = (await (await fetch("http://localhost:5320/hello-world?id=4")).json());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(test1.typeof, "number");
            DenoAsserts.assertEquals(test1.value, 42);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}