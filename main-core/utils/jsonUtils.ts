// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "./commonUtils.ts";

export class JsonUtils {

    public static toJson(json: string, options: { isFile: boolean, allowEnvironmentalReferences: boolean, handleException?: ((ex: any) => any) | undefined } = { isFile: false, allowEnvironmentalReferences: true, handleException: undefined }) {
        try {
            if(options.isFile) json = CommonUtils.readFile(json);
            if(!json) throw new Error("Json could not be parsed because it was either invalid or the referential file does not exist.");
            if(options.allowEnvironmentalReferences) json = CommonUtils.processVariableReferencesForEnvironmental(json);
            return JSON.parse(json, (key, value) => CommonUtils.parseToKnownType(value));
        }catch(ex){
            if(options.handleException) {
                return options.handleException(ex);
            } else {
                throw ex;
            }
        }
    }

    private static constructWalkJsonResponse(path: string, originalJson: string): Mandarine.Miscellaneous.WalkJson {
        let valueFromPath = JsonUtils.getValueFromObjectByDots(originalJson, path);
        let typeofValue = (valueFromPath === (undefined || null)) ? undefined : typeof(valueFromPath);
        const isArray = Array.isArray(valueFromPath);
        return {
            path: path,
            typeof: <string> ((isArray) ? 'array' : typeofValue),
            isArray: isArray,
            isPlainObject: CommonUtils.isObject(valueFromPath)
        };
    }

    public static getValueFromObjectByDots(object: any, keys: string): any {
        return keys?.split('.').reduce((o, k) => (o || {})[k], object || {});
    }

    public static walkJson(json: string, originalJson: string | undefined = undefined, parent: string | undefined = undefined): Array<Mandarine.Miscellaneous.WalkJson> { 
        if(!originalJson) originalJson = json;
        let returnValue: Array<Mandarine.Miscellaneous.WalkJson> = new Array<Mandarine.Miscellaneous.WalkJson>();
        Object.keys(json).forEach((key: any) => {
            if(CommonUtils.isObject(json[key])) {
                parent = !parent ? key : `${parent}.${key}`;
                returnValue = returnValue.concat([JsonUtils.constructWalkJsonResponse(<string> parent, <string> originalJson)]);
                returnValue = returnValue.concat(JsonUtils.walkJson(json[key], originalJson, parent));
            } else {
                let path = (parent !== undefined) ? `${parent}.${key}` : key;
                returnValue.push(JsonUtils.constructWalkJsonResponse(path, <string> originalJson));
            }
        });
        return returnValue;
    }

    public static processJson(json: any, processor: (value: any) => void, originalJson: string | undefined = undefined, parent: string | undefined = undefined): any {
        if(!originalJson) originalJson = json;
        let returnValue: any = {};
        Object.keys(json).forEach((key) => {
            if(CommonUtils.isObject(json[key])) {
                parent = !parent ? key : `${parent}.${key}`;
                returnValue = returnValue.concat([JsonUtils.constructWalkJsonResponse(parent, <string> originalJson)]);
                returnValue = returnValue.concat(JsonUtils.walkJson(json[key], originalJson, parent));
            } else {
                let path = (parent !== undefined) ? `${parent}.${key}` : key;
                returnValue.push(JsonUtils.constructWalkJsonResponse(path, <string> originalJson));
            }
        });
    }
}