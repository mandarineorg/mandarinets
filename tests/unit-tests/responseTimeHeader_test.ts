// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.
import { Orange } from "https://deno.land/x/orange@v0.3.0/lib/core.ns.ts";
import { Test } from "https://deno.land/x/orange@v0.3.0/lib/decorators/testDecorator.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../mod.ts";
import { responseTimeHandler } from "../../mvc-framework/core/middlewares/responseTimeHeaderMiddleware.ts";
import { DenoAsserts } from "../mod.ts";

export class ResponseTimeHeaderTest {

    constructor() {
        Orange.setOptions(this, {
            hooks: {
                beforeEach: () => ApplicationContext.getInstance().getComponentsRegistry().clearComponentRegistry()
            }
        })
    }

    @Test({
        name: "Test Response Header creator"
    })
    public testResponseHeader() {

        Mandarine.Global.setConfiguration({
            mandarine: {
                server: {
                    responseTimeHeader: true
                }
            }
        })

        const fakeRequest: any = {
            timeMetadata: {

            },
            response: {
                headers: new Headers()
            }
        }

        let preRequest = true;

        Date.now = (): number => {
            if(preRequest) {
                preRequest = false;
                return 10;
            } else {
                return 12;
            }
        };

        responseTimeHandler(fakeRequest, {
            responseTimeIsPostRequest: false
        });
        responseTimeHandler(fakeRequest, {
            responseTimeIsPostRequest: true
        });
        DenoAsserts.assertEquals(fakeRequest.response.headers.get("X-Response-Time"), "2");
    }

    @Test({
        name: "Test Response Header creator should be NULL"
    })
    public testResponseHeaderNull() {

        Mandarine.Global.setConfiguration({
            mandarine: {
                server: {
                    responseTimeHeader: false
                }
            }
        })
        
        const fakeRequest: any = {
            timeMetadata: {

            },
            response: {
                headers: new Headers()
            }
        }

        responseTimeHandler(fakeRequest);
        responseTimeHandler(fakeRequest, {
            responseTimeIsPostRequest: true
        });
        DenoAsserts.assertEquals(fakeRequest.response.headers.get("X-Response-Time"), null);
    }
}