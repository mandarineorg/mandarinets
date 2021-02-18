// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class TimerTestFile {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    @Test({
        name: "Fixed rate timers & Cron",
        description: "Test that timers are working properly and have access to DI"
    })
    public async websocketServer() {
        const currentDate = new Date();
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/timers.ts`],
            stdout: "piped",
            stderr: "inherit",
            stdin: "null"
        });
        console.log("Sleeping");
        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS + (45));

        const output = new TextDecoder().decode(await cmd.output());
        DenoAsserts.assertStringIncludes(output, `CRON Andres`);
        DenoAsserts.assertStringIncludes(output, "TIMER Andres");

        cmd.close();

    }

}