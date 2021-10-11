// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class TemplatesTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT06] Test Endpoints from `files/templates.ts`",
        description: "Verifies manual templates are working properly"
    })
    public async testTemplatesEndpoints() {
        let cmd = await waitForMandarineServer("templates.ts");

        let ejsTemplate = (await (await fetch("http://localhost:8090/manual-template-ejs")).text());
        let handlebarsTemplate = (await (await fetch("http://localhost:8090/manual-template-handlebars")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(ejsTemplate, "<h2>Will</h2>");
            DenoAsserts.assertEquals(handlebarsTemplate, "<h1>Andres</h1>");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}