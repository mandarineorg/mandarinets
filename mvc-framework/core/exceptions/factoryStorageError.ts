export class FactoryStorageError extends Error {

    public static UNKNOWN_OBJECT: string = "Context for object could not be read.";
    public static NONVALID_OBJECT: string = "Object already exists. Components cannot have the same name";
  
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "FactoryStorageError";
      this.stack = (new Error()).stack;
    }
  
}