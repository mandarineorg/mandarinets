// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class CustomCatchTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT01]  Test Endpoints from `files/customCatch.ts`",
        description: "Test all endpoints in file, and verifies that a custom exception catcher is working."
    })
    public async testCustomCatch() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/customCatch.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let internalServerError = (await (await fetch("http://localhost:2490/throw")).text());
        let customException = (await (await fetch("http://localhost:2490/throw-2")).json());
        let nothing = (await (await fetch("http://localhost:2490/do-not-throw")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(internalServerError, "Internal Server Error");
            DenoAsserts.assertEquals(customException, {
                error: "A error has occured",
                msg: "MandarineException: An error has been thrown"
            });
            DenoAsserts.assertEquals(nothing, "Hello world");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}