// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import  * as YAML from "https://deno.land/std@0.85.0/encoding/yaml.ts";


export class YamlUtils {

    public static yamlFileToJS(path: string) {
        try {
            const content = Deno.readTextFileSync(path);
            return this.yamlToJS(content);
        } catch {
            return {};
        }
    }

    public static yamlToJS(yaml: string): any {
        return YAML.parse(yaml);
    }

    public static jsToYaml(js: any) {
        return YAML.stringify(js);
    }
    
}