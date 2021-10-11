// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class RouteParamTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT05] Test Endpoints from `files/routeParam.ts`",
        description: "Test all endpoints in file, and verifies its return values"
    })
    public async testSayHi() {
        let cmd = await waitForMandarineServer("routeParam.ts");

        let sayHiNameEndpoint = (await (await fetch("http://localhost:8081/say-hi-1/Andres")).json());
        let apiSayHiNameEndpoint = (await (await fetch("http://localhost:8081/api/say-hi-2/Bill")).json());
        let sayHiSecondEndpoint = (await (await fetch("http://localhost:8081/say-hi-3/Hannibal")).json());
        let getAllParameters = (await (await fetch("http://localhost:8081/parameters/Elon/Musk?age=49")).json());
        
        let errorThrown = undefined;

        try {
            DenoAsserts.assertEquals(sayHiNameEndpoint, { name: "Andres" });
            DenoAsserts.assertEquals(apiSayHiNameEndpoint, { name: "Bill" });
            DenoAsserts.assertEquals(sayHiSecondEndpoint, { name: "undefined" });
            DenoAsserts.assertEquals(getAllParameters, {
                query: {
                    age: "49"
                },
                route: {
                    name: "Elon",
                    lastname: "Musk"
                }
            })
        } catch(error) {
            errorThrown = error;
        }

        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}