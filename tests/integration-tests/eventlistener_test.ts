// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class EventListenerTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
    }

    @Test({
        name: "[IT04] Test OpenAPI from `files/event.ts`",
        description: "Verifies Mandarine dispatches events with access to injectables"
    })
    public async testEventListener() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/events.ts`],
            stdout: "piped"
        });
        await cmd.status();
        
        const stdoutOutput = new TextDecoder().decode(await cmd.output());
        DenoAsserts.assertStringIncludes(stdoutOutput, "ANDRES");
        DenoAsserts.assertStringIncludes(stdoutOutput, "ANDRES : async");
        cmd.close();
    }

}