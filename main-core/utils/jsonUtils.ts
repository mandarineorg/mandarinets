// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "./commonUtils.ts";

export class JsonUtils {

    public static toJson(json: string, options: { isFile: boolean, allowEnvironmentalReferences: boolean } = { isFile: false, allowEnvironmentalReferences: true }) {
        if(options.isFile) json = CommonUtils.readFile(json);
        if(!json) throw new Error("Json could not be parsed because it was either invalid or the referential file does not exist.");
        if(options.allowEnvironmentalReferences) json = CommonUtils.processVariableReferencesForEnvironmental(json);

        return JSON.parse(json, (key, value) => CommonUtils.parseToKnownType(value));
    }

    private static constructWalkJsonResponse(path, originalJson): Mandarine.Miscellaneous.WalkJson {
        let valueFromPath = JsonUtils.getValueFromObjectByDots(originalJson, path);
        let typeofValue = (valueFromPath === (undefined || null)) ? undefined : typeof(valueFromPath);
        const isArray = Array.isArray(valueFromPath);
        return {
            path: path,
            typeof: (isArray) ? 'array' : typeofValue,
            isArray: isArray,
            isPlainObject: CommonUtils.isObject(valueFromPath)
        };
    }

    public static getValueFromObjectByDots(object, keys: string): any {
        return keys.split('.').reduce((o, k) => (o || {})[k], object);
    }

    public static walkJson(json, originalJson = undefined, parent = undefined): Array<Mandarine.Miscellaneous.WalkJson> { 
        if(!originalJson) originalJson = json;
        let returnValue: Array<Mandarine.Miscellaneous.WalkJson> = new Array<Mandarine.Miscellaneous.WalkJson>();
        Object.keys(json).forEach((key) => {
            if(CommonUtils.isObject(json[key])) {
                parent = !parent ? key : `${parent}.${key}`;
                returnValue = returnValue.concat([JsonUtils.constructWalkJsonResponse(parent, originalJson)]);
                returnValue = returnValue.concat(JsonUtils.walkJson(json[key], originalJson, parent));
            } else {
                let path = (parent !== undefined) ? `${parent}.${key}` : key;
                returnValue.push(JsonUtils.constructWalkJsonResponse(path, originalJson));
            }
        });
        return returnValue;
    }

    public static processJson(json: any, processor: (value: any) => void, originalJson = undefined, parent = undefined): any {
        if(!originalJson) originalJson = json;
        let returnValue: any = {};
        Object.keys(json).forEach((key) => {
            if(CommonUtils.isObject(json[key])) {
                parent = !parent ? key : `${parent}.${key}`;
                returnValue = returnValue.concat([JsonUtils.constructWalkJsonResponse(parent, originalJson)]);
                returnValue = returnValue.concat(JsonUtils.walkJson(json[key], originalJson, parent));
            } else {
                let path = (parent !== undefined) ? `${parent}.${key}` : key;
                returnValue.push(JsonUtils.constructWalkJsonResponse(path, originalJson));
            }
        });
    }
}