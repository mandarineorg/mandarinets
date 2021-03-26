// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class CustomCatchTest {

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
        let cmd = await waitForMandarineServer("customCatch.ts");

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