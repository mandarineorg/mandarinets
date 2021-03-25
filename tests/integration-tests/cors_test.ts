import {DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test} from "../mod.ts";
import {CommonUtils} from "../../main-core/utils/commonUtils.ts";

export class CorsTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test CORS headers `files/cors.ts`",
        description: "Verifies Mandarine just returns CORS control headers for preflight requests"
    })
    public async testPreflightRequest() {
        let cmd = await this.waitForMandarineServer(`${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/cors.ts`)

        let response = await fetch("http://localhost:1228" +
            "/default", {method: 'OPTIONS', headers: {origin: "http://localhost"}});

        let allowOrigin = response.headers.get("Access-Control-Allow-Origin");

        const body = await response.text();

        try {
            DenoAsserts.assertEquals(allowOrigin, "http://localhost");
            DenoAsserts.assertEquals(body, "");
        } finally {
            cmd.close();
        }
    }

    @Test({
        name: "Test CORS-enabled action doing its thing",
        description: "Verifies Mandarine runs CORS-enabled actions if queried with their correct method"
    })
    public async testRunningAction() {
        let cmd = await this.waitForMandarineServer(`${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/cors.ts`)

        let response = await fetch("http://localhost:1228" +
            "/default", {method: 'PUT', headers: {origin: "http://localhost"}});

        const body = await response.text();
        try {
            DenoAsserts.assertEquals(body, "CORS-enabled PUT action");
        } finally {
            cmd.close();
        }
    }

    private waitForMandarineServer(fixturePath: string): Promise<Deno.Process> {

        return new Promise((resolve, reject) => {
            const proc = Deno.run({
                cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", fixturePath],
                stdout: "piped",
                stderr: "null",
                stdin: "null"
            });

            const lastOutput = new Uint8Array(1024)
            const textDecoder = new TextDecoder();
            let stdoutText = "";


            const readOutput = () => {
                proc.stdout!.read(lastOutput).then((bytesRead) => {
                    if (bytesRead === null) {
                        proc.stdout!.close();
                        reject("Process ended without having successfully started Mandarine server. Here its stdout: \n\n" + stdoutText);
                    } else {
                        stdoutText += textDecoder.decode(lastOutput);
                        if (stdoutText.indexOf("[MandarineMVC.class] Server has started") !== -1) {
                            proc.stdout!.close();
                            resolve(proc);
                        } else {
                            setTimeout(readOutput, 250);
                        }
                    }
                });
            };
            readOutput();
        });
    }
}
