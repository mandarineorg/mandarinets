import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const responseTimeHandler = (
  context: Mandarine.Types.RequestContext,
  isPostRequest: boolean = false
) => {
  const typedContext: Mandarine.Types.RequestContext = context;

  if (!isPostRequest) {
    typedContext.response.headers.set("X-Response-Time", Date.now().toString());
  } else {
    const currentDateString: string | null = typedContext.response.headers.get(
      "X-Response-Time"
    );
    if (currentDateString != null) {
      const responseTime: number = Date.now() - parseInt(currentDateString);
    }
  }
};
