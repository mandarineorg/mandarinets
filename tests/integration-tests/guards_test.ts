// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class GuardsTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 55;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT02] Test Endpoints from `files/guards.ts`",
        description: "Test all endpoints in file, and verifies that guards are working fine"
    })
    public async testGuardsEndpoints() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/guards.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let test1 = (await (await fetch("http://localhost:7555/hello-world")).text());
        let test2 = (await (await fetch("http://localhost:7555/protected")).text());

        let test3Req = await fetch("http://localhost:7555/protected-2");
        let test3 = await test3Req.text();


        let test4Req = await fetch("http://localhost:7555/hello-world-2");
        let test4 = await test4Req.text();

        let test5 = (await (await fetch("http://localhost:7555/hello-world-3")).text());

        let test6Req = await fetch("http://localhost:7555/hello-world-4");
        let test6 = await test6Req.text();

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(test1, "Hello world");
            DenoAsserts.assertEquals(test2, "Protection Passed");
            DenoAsserts.assertEquals(test3Req.status, 401);
            DenoAsserts.assertEquals(test3, "");
            DenoAsserts.assertEquals(test4Req.status, 401);
            DenoAsserts.assertEquals(test4, "");
            DenoAsserts.assertEquals(test5, "Passed");
            DenoAsserts.assertEquals(test6Req.status, 401);
            DenoAsserts.assertEquals(test6, "");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}