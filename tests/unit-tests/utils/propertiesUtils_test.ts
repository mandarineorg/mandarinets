// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange } from "../../mod.ts";
import { PropertiesUtils } from "../../../main-core/utils/propertiesUtils.ts";

export class PropertiesUtilsTest {

    @Test({
        name: "Test parsing properties file",
        description: "Should parse properties to a JS object"
    })
    public testPropertiesParsing() {
        const properties = ["mandarine.server.host=127.0.0.1", "mandarine.server.port=8080", "mandarine.enabled=true", "mandarine.auth.data.config.user=andreespirela"];
        const propertiesText = properties.join(`\n`);
        const parsing = PropertiesUtils.parse(propertiesText);
        DenoAsserts.assertEquals({
            mandarine: {
                server: {
                    host: "127.0.0.1",
                    port: 8080
                },
                enabled: true,
                auth: {
                    data: {
                        config: {
                            user: "andreespirela"
                        }
                    }
                }
            }
        }, parsing);
    }
}