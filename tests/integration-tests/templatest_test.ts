// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

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
        name: "Test Endpoints from `files/templates.ts`",
        description: "Verifies manual templates are working properly"
    })
    public async testTemplatesEndpoints() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/templates.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

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