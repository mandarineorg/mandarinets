// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Test, DenoAsserts, Orange } from "../../mod.ts";
import { YamlUtils } from "../../../main-core/utils/yamlUtils.ts";

export class PropertiesUtilsTest {

    @Test({
        name: "Test parsing yaml file",
        description: "Should parse yaml to a JS object"
    })
    public testPropertiesParsing() {
        const expected = {
            "mandarine": { 
              "server": {
                "host": "127.0.0.1",
                "port": 8080
              },
              "enabled": true,
              "auth": {
                "data": {
                  "config": {
                    "username": "andreespirela"
                  }
                }
              }
            }
          };
        const yaml = YamlUtils.jsToYaml(expected);

        const parsing = YamlUtils.yamlToJS(yaml);
        DenoAsserts.assertEquals(parsing, expected);
    }
}