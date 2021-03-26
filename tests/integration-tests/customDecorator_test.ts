// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class CustomDecoratorIntTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT01] Test Endpoints from `files/customDecorator.ts`",
        description: "Test all endpoints in file, and verifies that a simple custom decorator is working fine."
    })
    public async testCustomDecorator() {
        let cmd = await waitForMandarineServer("customDecorator.ts");

        let customDecoratorMsg = (await (await fetch("http://localhost:2193/hello-world")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(customDecoratorMsg, "HAHAHA OKEYYY ES OBER!");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}