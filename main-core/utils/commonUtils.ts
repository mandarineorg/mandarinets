// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";
import type { Mandarine } from "../Mandarine.ns.ts";
import { Leaf } from "../../deps.ts";
import { IndependentUtils } from "./independentUtils.ts";

export class CommonUtils {
    public static generateUUID(): string {
        return v4.generate();
    }

    public static compareObjectKeys(a: object, b: object): boolean {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    public static readFile(filePath: string, decoderType?: string): any {
        if(decoderType == (null || undefined)) decoderType = "utf-8";

        let decoder;
        try {
            decoder = new TextDecoder(decoderType);
        } catch(error) {
            decoder = new TextDecoder();
        }

        const data = Leaf.readFileSync(filePath);
        return decoder.decode(data);
    }

    public static fileDirExists(path: string): boolean  {
        try {
          Deno.statSync(path);
          return true;
        } catch (error) {
          return false;
        }
    }

    public static setEnvironmentVariablesFromObject(object: any) {
        Object.keys(object).forEach((key: string) => {
            const value = object[key];
            if(typeof value === 'object' && !Array.isArray(value)) throw new MandarineException(MandarineException.ENV_VARIABLE_ISNT_STRING.replace('%s', key), true);
            Deno.env.set(key, value.toString());
        });
    }

    public static sleep(seconds: number) 
    {
        let e = new Date().getTime() + (seconds * 1000);
        while (new Date().getTime() <= e) {}
    }

    public static arrayIdentical(arr1: Array<any>, arr2: Array<any>){
        if (arr1.length !== arr2.length) return false;
        for (var i = 0, len = arr1.length; i < len; i++){
            let val1 = arr1[i];
            let val2 = arr2[i];
            if(val1 instanceof RegExp) val1 = val1.toString();
            if(val2 instanceof RegExp) val2 = val2.toString();
            if (val1 !== val2){
                return false;
            }
        }
        return true; 
    }

    public static isObject(o: any): boolean {
        return IndependentUtils.isObject(o);
    }

    public static isNumeric(num: any) {
        return !isNaN(num);
    }

    public static parseToKnownType(value: any) {
        if(value === "true" || value === true) return true;
        if(value === "false" || value === false) return false;
        if(CommonUtils.isNumeric(value)) return parseFloat(value);
        return value;
    }

    public static async asyncIteratorToArray(iterator: any) {
        const arr = [];
        for await (const entry of iterator) {
          arr.push(entry);
        }
        return arr;
    }

    public static getVariableReference(str: string, useEnvironmental: boolean = true): Array<Mandarine.EnvironmentalReference> {
        const regex = /\$\{(.*?)}/gm;
        let m;
        const returnValue: Array<Mandarine.EnvironmentalReference> = new Array<Mandarine.EnvironmentalReference>();

        while ((m = regex.exec(str)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
                
            const variable = m[1];
            const fullVariable = m[0];
            const environmentalValue = useEnvironmental ? Deno.env.get(variable) : undefined;
            let environmentalReference: Mandarine.EnvironmentalReference = {
                variable: variable,
                fullReference: fullVariable,
                environmentalValue: environmentalValue
            };
            returnValue.push(environmentalReference);
        }

        return returnValue;
    }

    public static processVariableReferencesForEnvironmental(str: string): string {
        let currentStr = str;
        const references = CommonUtils.getVariableReference(str);
        references.forEach((currentReference) => {
            if(currentReference.environmentalValue) {
                currentStr = currentStr.replace(currentReference.fullReference, currentReference.environmentalValue);
            }
        });
        return currentStr;
    }

}