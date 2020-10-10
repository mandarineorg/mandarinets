// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const responseTimeHandler = (context: Mandarine.Types.RequestContext, isPostRequest: boolean = false) => {
  const typedContext: Mandarine.Types.RequestContext = context;

  const config = Mandarine.Global.getMandarineConfiguration();
  if(!config.mandarine.server.responseTimeHeader) return;
  
  if(!typedContext.timeMetadata) typedContext.timeMetadata = { 
    startedAt: 0,
    finishedAt: 0
  };

  if (!isPostRequest) {
    typedContext.timeMetadata.startedAt = Date.now();
  } else {
    typedContext.timeMetadata.finishedAt = Date.now();

    const { finishedAt, startedAt } = typedContext.timeMetadata;

    const responseTime: number = finishedAt - startedAt;
    typedContext.response.headers.set("X-Response-Time", responseTime.toString());

  }
};
