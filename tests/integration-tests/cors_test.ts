import {DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test} from "../mod.ts";
import {CommonUtils} from "../../main-core/utils/commonUtils.ts";

export class CorsTest {
    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test CORS headers `files/cors.ts`",
        description: "Verifies Mandarine returns CORS control headers for preflight requests"
    })
    public async testAllowOriginHappyCase() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/cors.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let response = await fetch("http://localhost:1228" +
            "/default", {method: 'OPTIONS', headers: {origin: "http://localhost"}});

        let allowOrigin = response.headers.get("Access-Control-Allow-Origin");

        await response.arrayBuffer();

        try {
            DenoAsserts.assertEquals(allowOrigin, "http://localhost");
        } finally {
            cmd.close();
        }
    }
}
