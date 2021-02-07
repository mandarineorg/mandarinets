// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineORMException extends Error {

    public static INVALID_REPOSITORY: string = "The repository could not be loaded because it is an incorrect repository or it has an invalid model.";
    public static UNKNOWN_DIALECT: string = "The dialect you are trying to use is not supported by Mandarine. See more here https://mandarineframework.gitbook.io/mandarine-ts/mandarine-data/orm#dialects";
    public static GENERATION_HANDLER_REQUIRED: string = "The strategy for primary key is 'MANUAL'. You must identify a handler in order to generate values";
    public static IMPOSSIBLE_CONNECTION: string = "The connection could not be made because the database client did not accept it.";
    public static INSTANCE_IN_SAVE: string = "Saving an instance is not a valid save statement. Please save an initialized object.";
    public static MQL_INVALID_KEY: string = "MQL has failed to process the expression.";
    public static QUERY_BEFORE_CONNECTION: string = "A query has been requested but the connection is not initialized.";
    public static RESERVED_KEYWORD_COLNAME: string = "Name (%column%) is a reserved keyword and cannot be used for column.";
    
    constructor(public message: string, public objectName: string) {
      super(message + " ~ Object name: " + objectName);
      this.name = "MandarineORMException";
      this.stack = (new Error()).stack;
    }
  
}