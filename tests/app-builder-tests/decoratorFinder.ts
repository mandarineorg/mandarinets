import { AppBuilder } from "../../main-core/app-builder/appBuilder.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Test } from "../mod.ts";


export class AppBuilderIntgTest {

    @Test({
        name: "Integration test for automatic build & run",
        description: "Check it works in windows & mac"
    })
    public async testint() {
        const process = new AppBuilder().setPort(1999).automaticBuildAndRun({
            tsconfigPath: "../../tsconfig.json",
            flags: ["--allow-all", "--unstable"],
            mandarineVersion: "v2.2.0"
        });

        CommonUtils.sleep(50);

        let testingManualInjection = (await (await fetch("http://localhost:1999/hello")).text());

        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(testingManualInjection, "Hi");
        } catch(error) {
            errorThrown = error;
        }
        
        process.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}
