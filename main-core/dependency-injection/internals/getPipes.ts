// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Reflect } from "../../reflectMetadata.ts"
import { MandarineConstants } from "../../mandarineConstants.ts"

export const getPipes = (target: any, paramIndex: number, methodName: string) => {
    return Reflect.getMetadata(`${MandarineConstants.REFLECTION_MANDARINE_PIPE_FIELD}:${paramIndex}:${methodName}`, target, methodName);
}