// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class OpenAPITest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
    }

    @Test({
        name: "[IT04] Test OpenAPI from `files/openAPI.ts`",
        description: "Verifies Mandarine generates the right file structure for OpenAPI metadata"
    })
    public async testOpenAPIFileGenerated() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/openAPI.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });
        await cmd.status();

        const fileContent = Deno.readTextFileSync('./openapi.yml');
        const fileContentExpected = Deno.readTextFileSync('./tests/integration-tests/resources/openapi.yml');
        DenoAsserts.assertStringIncludes(fileContent, fileContentExpected);
        cmd.close();
    }

}