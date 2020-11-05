// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../Mandarine.ns.ts";
import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { MandarineException } from "../../exceptions/mandarineException.ts";

export const executePipe = (pipe: any, valueToProcess: any) => {
    const pipeFromDI: Mandarine.Types.PipeTransform | undefined = ApplicationContext.getInstance().getDIFactory().getDependency(pipe);
    if(pipeFromDI) {
        valueToProcess = pipeFromDI.transform(valueToProcess);
    } else if(!pipeFromDI && typeof pipe === 'function') {
        valueToProcess = pipe(valueToProcess);
    } else {
        throw new MandarineException(MandarineException.INVALID_PIPE_EXECUTION);
    }
    return valueToProcess;
}