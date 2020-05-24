export class MandarineORMException extends Error {

    public static INVALID_REPOSITORY: string = "The repository could not be loaded because it is an incorrect repository or it has an invalid model.";
    public static UNKNOWN_DIALECT: string = "The dialect you are trying to use is not supported by Mandarine. See more here https://github.com/mandarineorg/mandarinets/wiki/Mandarine-Query-Language-(MQL)#platforms";
    public static GENERATION_HANDLER_REQUIRED: string = "The strategy for primary key is 'MANUAL'. You must identify a handler in order to generate values";
    public static IMPOSSIBLE_CONNECTION: string = "The connection could not be made because the database client did not accept it.";
    
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "MandarineORMException";
      this.stack = (new Error()).stack;
    }
  
}