// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class MiddlewareTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT03] Test Endpoints from `files/middleware.ts`",
        description: "Test all endpoints in file, and verifies middleware references are working fine"
    })
    public async testMiddlewareEndpoints() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/middleware.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let test1 = (await (await fetch("http://localhost:2024/with-middleware-controller")).json());
        let test2 = (await (await fetch("http://localhost:2024/with-middleware-method")).json());
        let test3 = (await (await fetch("http://localhost:2024/hello-world")).json());
        let test4 = (await (await fetch("http://localhost:2024/api/get-4")).json());
        let test5 = (await (await fetch("http://localhost:2024/api/get-5")).json());
        let test6 = (await (await fetch("http://localhost:2024/api/get-6")).json());
        let test7 = (await (await fetch("http://localhost:2024/api/get-7")).json());
        let test8 = (await (await fetch("http://localhost:2024/docs/my-doc")).json());
        let test9 = (await (await fetch("http://localhost:2024/docs-my-doc")).json());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(test1["TEST_MIDDLEWARE"], "Hello 10");
            DenoAsserts.assertEquals(test2["TEST_MIDDLEWARE"], "Hello 10");
            DenoAsserts.assertEquals(test3["TEST_MIDDLEWARE"], undefined);
            DenoAsserts.assertEquals(test4.request["TEST_MIDDLEWARE_NONCOMPONENT"], "Superman");
            DenoAsserts.assertEquals(test4.request["TEST_MIDDLEWARE"], undefined);
            DenoAsserts.assertEquals(test5.request["TEST_MIDDLEWARE_NONCOMPONENT"], "Superman");
            DenoAsserts.assertEquals(test6["TEST_MIDDLEWARE"], undefined);
            DenoAsserts.assertEquals(test6["TEST_MIDDLEWARE_NONCOMPONENT"], undefined);
            DenoAsserts.assertEquals(test7["TEST_MIDDLEWARE_NONCOMPONENT"], "Batman");
            DenoAsserts.assertEquals(test8["TEST_MIDDLEWARE"], "DOCS INTERCEPTION 10");
            DenoAsserts.assertEquals(test9["TEST_MIDDLEWARE"], undefined);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}