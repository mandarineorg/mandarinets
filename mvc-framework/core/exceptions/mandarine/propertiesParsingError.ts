export class PropertiesParsingError extends Error {

    public static NULL_PARSING: string = "An error has ocurred while trying to read initialization properties.";
  
    constructor(public message: string) {
      super(message);
      this.name = "PropertiesParsingError";
      this.stack = (new Error()).stack;
    }
  
}
