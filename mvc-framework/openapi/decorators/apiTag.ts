// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { IndependentUtils } from "../../../main-core/utils/independentUtils.ts";
import { addOpenAPILoaderInfo, openAPIApplicationBuilder } from "../openapi-global.ts";
import { OpenAPITagObject } from "../openapi-spec.ts";

export const ApiTag = (tag: OpenAPITagObject | Array<OpenAPITagObject | string> | string) => {
    return (target: any, methodName: string, propertyDesciptor: PropertyDescriptor) => {

        const consumer: Array<OpenAPITagObject> = [];
        
        if(typeof tag === "string") {
            consumer.push({ name: tag });
        }  else {
            if(Array.isArray(tag)) {
                tag.forEach((item) => {
                    if (typeof item === "string") {
                        consumer.push({ name: item });
                    } else if (IndependentUtils.isObject(item)) {
                        consumer.push(item);
                    }
                });
            } else if(IndependentUtils.isObject(tag)) {
                consumer.push(tag);
            }
        }

        addOpenAPILoaderInfo(target, {
            type: "ApiTag",
            methodName: methodName,
            data: consumer
        })
    }
}