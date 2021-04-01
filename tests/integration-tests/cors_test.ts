// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import {DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test, waitForMandarineServer} from "../mod.ts";
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
        let cmd = await waitForMandarineServer(`${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/cors.ts`)

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
        let cmd = await waitForMandarineServer(`${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/cors.ts`)

        let response = await fetch("http://localhost:1228" +
            "/default", {method: 'PUT', headers: {origin: "http://localhost"}});

        const body = await response.text();
        try {
            DenoAsserts.assertEquals(body, "CORS-enabled PUT action");
        } finally {
            cmd.close();
        }
    }
}
