// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { delay } from "https://deno.land/std@0.84.0/async/delay.ts";
import { CommonUtils } from "../../main-core/utils/commonUtils.ts";
import { DenoAsserts, INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY, Orange, Test } from "../mod.ts";

export class AuthenticationTest {

    public MAX_COMPILATION_TIMEOUT_SECONDS = 50;

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => CommonUtils.sleep(2)
            }
        })
    }

    private async requestEndpoint(endpoint: string, setCookie: string): Promise<Response> {
        let fetchData = await fetch("http://localhost:1227/" + endpoint, {
            headers: {
                'Cookie': setCookie
            }
        });
        return fetchData;
    }

    private getAuthCookies(cookiesVals: Array<string>): string {
        let authCookies: Array<string> = [];
        cookiesVals.forEach((val) => {
            if(val.startsWith("MDAUTHID")) {
                authCookies.push(val.split(";")[0]);
            }
        });
        return authCookies.join(";");
    }

    @Test({
        name: "Test Endpoints from `files/authentication.ts`",
        description: "Test all endpoints in file for authentication ."
    })
    public async testCustomCatch() {
        let cmd = Deno.run({
            cmd: ["deno", "run", "-c", "tsconfig.json", "--allow-all", "--unstable", `${INTEGRATION_TEST_FILES_TO_RUN_DIRECTORY}/authentication.ts`],
            stdout: "null",
            stderr: "null",
            stdin: "null"
        });

        let commonConfig = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };
        CommonUtils.sleep(this.MAX_COMPILATION_TIMEOUT_SECONDS);

        let fetchLoginTest = (await fetch("http://localhost:1227/login", {
            ...commonConfig,
            body: JSON.stringify({
                username: "test",
                password: "Changeme1"
            })
        }));
        let body = await fetchLoginTest.json();
        const testLoginCookies =  this.getAuthCookies(Array.from(fetchLoginTest.headers.values()));
        let fetchLoginTest2 = (await fetch("http://localhost:1227/login", {
            ...commonConfig,
            body: JSON.stringify({
                username: "test2",
                password: "Changeme1"
            })
        }));
        body = await fetchLoginTest2.json();
        const test2LoginCookies = this.getAuthCookies(Array.from(fetchLoginTest2.headers.values()));

        let fetchLoginTest3 = (await fetch("http://localhost:1227/login", {
            ...commonConfig,
            body: JSON.stringify({
                username: "test3",
                password: "Changeme1"
            })
        }));
        body = await fetchLoginTest3.json();
        const test3LoginCookies = this.getAuthCookies(Array.from(fetchLoginTest3.headers.values()));

        let fetchLoginTest4 = (await fetch("http://localhost:1227/login", {
            ...commonConfig,
            body: JSON.stringify({
                username: "test4",
                password: "Changeme1"
            })
        }));
        body = await fetchLoginTest4.json();
        const test4LoginCookies = this.getAuthCookies(Array.from(fetchLoginTest4.headers.values()));
        let errorThrown = undefined;
        try {
            const fetches = [
                await this.requestEndpoint("test-endpoint", testLoginCookies || ""),
                await this.requestEndpoint("test-endpoint", test2LoginCookies || ""),
                await this.requestEndpoint("test-endpoint", test3LoginCookies || ""),
                await this.requestEndpoint("test-endpoint", test4LoginCookies || "")
            ]
            const principals = [
                await (fetches[0]).json(),
                await (fetches[1]).json(),
                await (fetches[2]).json(),
                await (fetches[3]).json()
            ];

            DenoAsserts.assertEquals(fetches[0].status, 200);
            DenoAsserts.assertEquals(fetches[1].status, 200);
            DenoAsserts.assertEquals(fetches[2].status, 200);
            DenoAsserts.assertEquals(fetches[3].status, 200);

            DenoAsserts.assertEquals(principals, [
                {
                  "roles": [
                    "ADMIN",
                    "MODERATOR"
                  ],
                  "password": "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
                  "username": "test",
                  "uid": 1,
                  "accountExpired": false,
                  "accountLocked": false,
                  "credentialsExpired": false,
                  "enabled": true
                },
                {
                  "roles": [
                    "ADMIN"
                  ],
                  "password": "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
                  "username": "test2",
                  "uid": 2,
                  "accountExpired": false,
                  "accountLocked": false,
                  "credentialsExpired": false,
                  "enabled": true
                },
                {
                  "roles": [
                    "USER"
                  ],
                  "password": "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
                  "username": "test3",
                  "uid": 2,
                  "accountExpired": false,
                  "accountLocked": false,
                  "credentialsExpired": false,
                  "enabled": true
                },
                {
                  "roles": [
                    "MODERATOR"
                  ],
                  "password": "$2a$10$q9ndDolU5EM0PFy1Zu2I7Ougcw/oHrkB8/mCBf01Fuae6okON.61O",
                  "username": "test4",
                  "uid": 2,
                  "accountExpired": false,
                  "accountLocked": false,
                  "credentialsExpired": false,
                  "enabled": true
                }
            ]);

            const adminFetches = [
                await this.requestEndpoint("only-admins", testLoginCookies),
                await this.requestEndpoint("only-admins", test2LoginCookies),
                await this.requestEndpoint("only-admins", test3LoginCookies),
                await this.requestEndpoint("only-admins", test4LoginCookies),
                await this.requestEndpoint("user", "null")
            ];

            const canAccessOnlyAdmins = [
                await adminFetches[0].text(),
                await adminFetches[1].text(),
                await adminFetches[2].text(),
                await adminFetches[3].text(),
                await adminFetches[4].text(),
            ];
            DenoAsserts.assertEquals(adminFetches[0].status, 200);
            DenoAsserts.assertEquals(adminFetches[1].status, 200);
            DenoAsserts.assertEquals(adminFetches[2].status, 401);
            DenoAsserts.assertEquals(adminFetches[3].status, 401);
            DenoAsserts.assertEquals(adminFetches[4].status, 401);
            DenoAsserts.assertEquals(canAccessOnlyAdmins[0], "You are admin and are authenticated");
            DenoAsserts.assertEquals(canAccessOnlyAdmins[1], "You are admin and are authenticated");
            DenoAsserts.assertEquals(canAccessOnlyAdmins[2], "");
            DenoAsserts.assertEquals(canAccessOnlyAdmins[3], "");
            DenoAsserts.assertEquals(canAccessOnlyAdmins[4], "");

            const userFetches = [
                await this.requestEndpoint("user", testLoginCookies),
                await this.requestEndpoint("user", test2LoginCookies),
                await this.requestEndpoint("user", test3LoginCookies),
                await this.requestEndpoint("user", test4LoginCookies),
                await this.requestEndpoint("user", "")
            ];

            const isUser = [
                await userFetches[0].text(),
                await userFetches[1].text(),
                await userFetches[2].text(),
                await userFetches[3].text(),
                await userFetches[4].text(),
            ];

            DenoAsserts.assertEquals(userFetches[0].status, 200);
            DenoAsserts.assertEquals(userFetches[1].status, 200);
            DenoAsserts.assertEquals(userFetches[2].status, 200);
            DenoAsserts.assertEquals(userFetches[3].status, 200);
            DenoAsserts.assertEquals(userFetches[4].status, 401);
            DenoAsserts.assertEquals(isUser[0], "You just need to be logged-in");
            DenoAsserts.assertEquals(isUser[1], "You just need to be logged-in");
            DenoAsserts.assertEquals(isUser[2], "You just need to be logged-in");
            DenoAsserts.assertEquals(isUser[3], "You just need to be logged-in");
            DenoAsserts.assertEquals(isUser[4], "");

            const adminFetches2 = [
                await this.requestEndpoint("are-admin", test2LoginCookies),
                await this.requestEndpoint("are-admin", test4LoginCookies),
                await this.requestEndpoint("are-admin", "")
            ];

            const isAdmin = [
                await adminFetches2[0].text(),
                await adminFetches2[1].text(),
                await adminFetches2[2].text(),
            ];

            DenoAsserts.assertEquals(adminFetches2[0].status, 200);
            DenoAsserts.assertEquals(adminFetches2[1].status, 401);
            DenoAsserts.assertEquals(adminFetches2[2].status, 401);
            DenoAsserts.assertEquals(isAdmin[0], "You are admin");
            DenoAsserts.assertEquals(isAdmin[1], "");
            DenoAsserts.assertEquals(isAdmin[2], "");

            const modAdmFetches = [
                await this.requestEndpoint("moderator-admin", testLoginCookies),
                await this.requestEndpoint("moderator-admin", test4LoginCookies),
                await this.requestEndpoint("only-moderator-h", test4LoginCookies),
                await this.requestEndpoint("only-moderator-h", "")
            ];

            const isModORAdm = [
                await modAdmFetches[0].text(),
                await modAdmFetches[1].text(),
                await modAdmFetches[2].text(),
                await modAdmFetches[3].text(),
            ];

            DenoAsserts.assertEquals(modAdmFetches[0].status, 200);
            DenoAsserts.assertEquals(modAdmFetches[1].status, 401);
            DenoAsserts.assertEquals(modAdmFetches[2].status, 200);
            DenoAsserts.assertEquals(modAdmFetches[3].status, 401);
            DenoAsserts.assertEquals(isModORAdm[0], "You are moderator & admin");
            DenoAsserts.assertEquals(isModORAdm[1], "");
            DenoAsserts.assertEquals(isModORAdm[2], "You are just a moderator");
            DenoAsserts.assertEquals(isModORAdm[3], "");

            const securityExpressionFetches = [
                await this.requestEndpoint("security-expressions", test3LoginCookies),
                await this.requestEndpoint("security-expressions", test4LoginCookies),

                await this.requestEndpoint("security-expressions-2", test3LoginCookies),
                await this.requestEndpoint("security-expressions-2", testLoginCookies),
                await this.requestEndpoint("security-expressions-2", test4LoginCookies),

                await this.requestEndpoint("security-expressions-5", testLoginCookies),
                await this.requestEndpoint("security-expressions-5", test4LoginCookies),

                await this.requestEndpoint("security-expressions", "-"),
            ];

            const secExpressionResults = [
                await securityExpressionFetches[0].text(),
                await securityExpressionFetches[1].text(),
                await securityExpressionFetches[2].text(),
                await securityExpressionFetches[3].text(),
                await securityExpressionFetches[4].text(),
                await securityExpressionFetches[5].text(),
                await securityExpressionFetches[6].text(),
                await securityExpressionFetches[7].text()
            ];

            DenoAsserts.assertEquals(securityExpressionFetches[0].status, 200);
            DenoAsserts.assertEquals(securityExpressionFetches[1].status, 401);
            DenoAsserts.assertEquals(securityExpressionFetches[2].status, 200);
            DenoAsserts.assertEquals(securityExpressionFetches[3].status, 200);
            DenoAsserts.assertEquals(securityExpressionFetches[4].status, 401);
            DenoAsserts.assertEquals(securityExpressionFetches[5].status, 200);
            DenoAsserts.assertEquals(securityExpressionFetches[6].status, 401);
            DenoAsserts.assertEquals(securityExpressionFetches[7].status, 401);

            DenoAsserts.assertEquals(secExpressionResults[0], "You are authenticated and have role USER");
            DenoAsserts.assertEquals(secExpressionResults[1], "");
            DenoAsserts.assertEquals(secExpressionResults[2], "You are authenticated and have role USER oR ADMIN");
            DenoAsserts.assertEquals(secExpressionResults[3], "You are authenticated and have role USER oR ADMIN");
            DenoAsserts.assertEquals(secExpressionResults[4], "");
            DenoAsserts.assertEquals(secExpressionResults[5], "just gotta be admin");
            DenoAsserts.assertEquals(secExpressionResults[6], "");
            DenoAsserts.assertEquals(secExpressionResults[7], "");

        } catch(error) {
            errorThrown = error;
        }
        
        cmd.close();
        if(errorThrown != undefined) {
            throw errorThrown;
        }
    }

}