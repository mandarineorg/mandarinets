// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MVCDecoratorsProxy } from "../../../proxys/mvcCoreDecorators.ts";

 /**
 * **Decorator**
 * 
 * Adds a pipe to the current parameter
 * 
 * `@Pipe()
 *  Target: Method parameter`
 * 
 * @returns a processed value from its inital input based on the pipe execution.
 */
export const Pipe = (pipes: Array<any> | any): Function => {
    return (target: any, propertyName: string, index: number) => {
        MVCDecoratorsProxy.registerPipeInParam(target, pipes, propertyName, index);
    }
}