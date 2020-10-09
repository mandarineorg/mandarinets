import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const responseTimeHandler = (context: Mandarine.Types.RequestContext, isPostRequest: boolean = false) => {
  const typedContext: Mandarine.Types.RequestContext = context;

  if (!isPostRequest) {
    typedContext.timeMetadata.startedAt = Date.now();
  } else {
    typedContext.timeMetadata.finishedAt = Date.now();

    const { finishedAt, startedAt } = typedContext.timeMetadata;

    const responseTime: number = finishedAt - startedAt;
    typedContext.response.headers.set("X-Response-Time", responseTime.toString());

  }
};
