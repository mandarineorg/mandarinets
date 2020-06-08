export class InvalidAnnotationError extends Error {

    public static CLASS_ONLY_ANNOTATION: string = "The annotation is not valid in the current context. Annotation should only be used for class type.";
    public static METHOD_ONLY_ANNOTATION: string = "The annotation is not valid in the current context. Annotation should only be used for method type.";
  
    constructor(public message: string) {
      super(`${message}`);
      this.name = "InvalidAnnotationError";
      this.stack = (this).stack;
    }
  
}
