import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class NestedInjectionTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 20;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test Endpoints from `files/nestedInjection.ts`",
        description: "Test all endpoints in file, and verifies its return values"
    })
    public async testPiInService() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/nestedInjections.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let testingManualInjection = (await (await fetch("http://localhost:8083/test")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(testingManualInjection, "3.14");
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}