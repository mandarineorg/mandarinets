import { mockDecorator, Orange, Test, DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY } from "../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";

export class RouteParamTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "Test Endpoints from `files/routeParam.ts`",
        description: "Test all endpoints in file, and verifies its return values"
    })
    public async testSayHi() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/routeParam.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let sayHiNameEndpoint = (await (await fetch("http://localhost:8081/say-hi/Andres")).json());
        let apiSayHiNameEndpoint = (await (await fetch("http://localhost:8081/api/say-hi/Bill")).json());
        let sayHiSecondEndpoint = (await (await fetch("http://localhost:8081/say-hi-2/Hannibal")).json());
        let errorThrown = undefined;

        try {
            DenoAsserts.assertEquals(sayHiNameEndpoint, { name: "Andres" });
            DenoAsserts.assertEquals(apiSayHiNameEndpoint, { name: "Bill" });
            DenoAsserts.assertEquals(sayHiSecondEndpoint, { name: "undefined" });
        } catch(error) {
            errorThrown = error;
        }

        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}