export class MandarineRepositoryException extends Error {

    public static INVALID_REPOSITORY: string = "The repository could not be loaded because it is an incorrect repository or it has an invalid model.";
  
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "MandarineRepositoryException";
      this.stack = (new Error()).stack;
    }
  
}