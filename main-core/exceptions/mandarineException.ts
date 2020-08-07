// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineException extends Error {

    public static MIDDLEWARE_NON_VALID_IMPL: string = "Middleware cannot be initialized because it is not an implemention of 'MiddlewareTarget'";
    public static INVALID_TEMPLATE: string = "The template %templatePath% could not be initialized. This may be caused because the path is incorrect.";
    public static UNDEFINED_TEMPLATE: string = "The template could not be initialized because its path is undefined";
    public static INVALID_PROPERTY_FILE: string = "The property file (%propertyFile%) you are trying to use is either invalid or could not be parsed";
    public static INVALID_STATIC_FOLDER: string = "Found static folder (%staticFolder%) but the path is either invalid or does not exist.";
    public static ROUTE_ALREADY_EXIST: string = "Mandarine cannot be initialized because a route ($s) already exists. Routes must be different.";
    public static ENV_VARIABLE_ISNT_STRING: string = "The value for environmental variable '%s' cannot be read. Only arrays or strings are allowed.";
  
    constructor(public message: string, public superAlert: boolean = false) {
      super(message);
      this.name = "MandarineException";
      this.stack = (this).stack;
    }
  
}