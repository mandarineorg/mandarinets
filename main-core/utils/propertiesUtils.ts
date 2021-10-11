// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { CommonUtils } from "./commonUtils.ts";
import { MandarineUtils } from "./mandarineUtils.ts";

export class PropertiesUtils {

    private static parseLine(obj: any, keys: string | Array<string>, value: any)
    {
        keys = (typeof keys === "string") ? keys.split(".") : keys;
        const key = keys.shift()!;
    
        if (keys.length === 0)
        {
            obj[key] = value;
            return;
        }
        else if (!obj.hasOwnProperty(key))
        {
            obj[key] = {};
        }
    
        this.parseLine(obj[key], keys, CommonUtils.parseToKnownType(value));
        return obj;
    }

    public static parse(input: string) {
        const dividedInput = MandarineUtils.parseConfigurationFile(input);
        const object = {};

        Object.keys(dividedInput).forEach((key) => {
            this.parseLine(object, key, dividedInput[key]);
        });

        return object;
    }

    public static propertiesToJS(path: string) {
        try {
            const content = Deno.readTextFileSync(path);
            return this.parse(content);
        } catch {
            return {};
        }
    }

}