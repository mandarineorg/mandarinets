// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class ResourceHandlerStaticContentTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT04] Test Endpoints from `files/resourceHandlerStaticContent.ts`",
        description: "Verifies Mandarine is serving static content"
    })
    public async testTemplatesEndpoints() {
        let cmd = await waitForMandarineServer("resourceHandlerStaticContent.ts");

        let resourceRequest = (await (await fetch("http://localhost:8091/docs/testing/helloWorld.txt")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(resourceRequest, "Hello there, if you have got here, you'd better go back!.");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}