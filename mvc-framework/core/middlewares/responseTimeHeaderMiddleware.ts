// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../main-core/Mandarine.ns.ts";
import { MandarineMvc } from "../../mandarine-mvc.ns.ts";

interface MiddlewareData {
  responseTimeIsPostRequest: boolean;
}

const defaultMiddlewareData: MiddlewareData = {
  responseTimeIsPostRequest: false
}

export const responseTimeHandler: MandarineMvc.Internal.InternalMiddlewareFunc = (context: Mandarine.Types.RequestContext, data: MiddlewareData = defaultMiddlewareData) => {
  const typedContext: Mandarine.Types.RequestContext = context;

  const config = Mandarine.Global.getMandarineConfiguration();
  if(!config.mandarine.server.responseTimeHeader) return true;
  
  if(!typedContext.timeMetadata) typedContext.timeMetadata = { 
    startedAt: 0,
    finishedAt: 0
  };

  if (!data.responseTimeIsPostRequest) {
    typedContext.timeMetadata.startedAt = Date.now();
  } else {
    typedContext.timeMetadata.finishedAt = Date.now();

    const { finishedAt, startedAt } = typedContext.timeMetadata;

    const responseTime: number = finishedAt - startedAt;
    typedContext.response.headers.set("X-Response-Time", responseTime.toString());

  }

  return true;
};
