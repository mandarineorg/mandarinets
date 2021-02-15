// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class WebSocketTestFile {

    @Test({
        name: "WebSocket server",
        description: "Test the creation of a websocket server through Mandarine"
    })
    public async websocketServer() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/websocketServer.ts`],
            stdout: "piped",
            stderr: "inherit",
            stdin: "null"
        });

        CommonUtils.sleep(5);

        let cmd2 = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/websocketClient.ts`],
            stdout: "null",
            stderr: "inherit",
            stdin: "null"
        });
        
        CommonUtils.sleep(30);
        cmd2.close();
        CommonUtils.sleep(30);
        cmd.close();

        const output = new TextDecoder().decode(await cmd.output());
        DenoAsserts.assertStringIncludes(output, "Hello Maria from stdout");
        DenoAsserts.assertStringIncludes(output, "Hello Andres from stdout");
        DenoAsserts.assertStringIncludes(output, "Hello Snejana from stdout");

    }

}