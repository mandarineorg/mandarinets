// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, Orange, Test, waitForMandarineServer } from "../mod.ts";

export class SessionCounterTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    @Test({
        name: "[IT05] Test Endpoints from `files/sessionCounter.ts`",
        description: "Verifies Mandarine native session system is working properly"
    })
    public async testSessionCounter() {
        let cmd = await waitForMandarineServer("sessionCounter.ts");

        let sessionCounter = (await (await fetch("http://localhost:8084/session-counter")).json());
        let sessionIdCookie = sessionCounter.sessionId;

        let headers = new Headers();
        headers.set("Cookie", sessionIdCookie);

        let sessionCounterSecondRequest = (await (await fetch("http://localhost:8084/session-counter", {
            headers: headers
        })).json());


        let sessionCounterThirdRequest = (await (await fetch("http://localhost:8084/session-counter", {
            headers: headers
        })).json());


        let errorThrown = undefined;
        try {
            DenoAsserts.assertEquals(sessionCounter.times, 0);
            DenoAsserts.assertEquals(sessionCounterSecondRequest.times, 1);
            DenoAsserts.assertEquals(sessionCounterThirdRequest.times, 2);
        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}