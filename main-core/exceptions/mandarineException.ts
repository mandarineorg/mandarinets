export class MandarineException extends Error {

    public static MIDDLEWARE_NON_VALID_IMPL: string = "Middleware cannot be initialized because it is not an implemention of 'MiddlewareTarget'";
  
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "MandarineException";
      this.stack = (new Error()).stack;
    }
  
}