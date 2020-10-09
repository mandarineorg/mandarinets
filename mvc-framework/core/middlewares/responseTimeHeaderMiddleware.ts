import { Mandarine } from "../../../main-core/Mandarine.ns.ts";

export const ExceptionHandler = (isPostRequest: boolean = false) => {
  return async (context: any, next: any) => {
    const typedContext: Mandarine.Types.RequestContext = context;

    if (!isPostRequest) {
      typedContext.response.headers.set(
        "X-Response-Time",
        new Date().toString()
      );
    } else {
      const currentDateString: string = typedContext.response.headers.get(
        "X-Response-Time"
      );
      const responseTime: number = Date.now() - <number>currentDateString;
    }
  };
};
