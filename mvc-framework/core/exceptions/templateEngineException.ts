export class TemplateEngineException extends Error {

    public static INVALID_TEMPLATE_PROCESSING: string = "The template could not be read because it has not been initialized or it is not valid.";
  
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "FactoryStorageError";
      this.stack = (new Error()).stack;
    }
  
}