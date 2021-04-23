// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineException extends Error {

    public static MIDDLEWARE_NON_VALID_IMPL: string = "Middleware cannot be initialized because it is not a valid implemention of 'MiddlewareTarget'";
    public static INVALID_TEMPLATE: string = "The template %templatePath% could not be initialized. This may be caused because the path is incorrect.";
    public static UNDEFINED_TEMPLATE: string = "The template could not be initialized because its path is undefined";
    public static INVALID_PROPERTY_FILE: string = "The property file (%propertyFile%) you are trying to use is either invalid or could not be parsed";
    public static INVALID_STATIC_FOLDER: string = "Found static folder (%staticFolder%) but the path is either invalid or does not exist.";
    public static ROUTE_ALREADY_EXIST: string = "Mandarine cannot be initialized because a route ($s) already exists. Routes must be different.";
    public static ENV_VARIABLE_ISNT_STRING: string = "The value for environmental variable '%s' cannot be read. Only arrays or strings are allowed.";
    public static INVALID_OVERRIDEN: string = "Invalid native component overriding";
    public static INVALID_OVERRIDEN_ON_METHOD: string = "Return value from %s is not a compatible value for overriding";
    public static UNKNOWN_OVERRIDEN: string = "Mandarine could not execute internal override because %s is not of a known native component.";
    public static ON_INITIALIZATION_OVERRIDEN: string = "The method `onInitialization` cannot be overriden because it is a Mandarine reserved method.";
    public static INVALID_ALLOWONLY_DECORATOR_PERMISSIONS: string = "Decorator `@AllowOnly` only receives an array or a security expression (string).";
    public static INVALID_MIDDLEWARE_LIST_ANNOTATION: string = "Decorator `@UseMiddleware` is being used but a list of undefined values was passed.";
    public static INVALID_GUARDS_LIST_ANNOTATION: string = "Decorator `@UseGuards` is being used but a list of undefined values was passed.";
    public static INVALID_MIDDLEWARE_UNDEFINED: string = "Middleware cannot be initialized because it is undefined.";
    public static INVALID_PIPE_LOCATION: string = "Pipes can only target parameters of a HTTP Handler";
    public static INVALID_PIPE_EXECUTION: string = "Pipe execution failed because it's either an invalid pipe or an exception was thrown during transformation";
    public static INVALID_GUARD_EXECUTION: string = "A guard was found but it is not a valid mandarine-powered component nor a function";
    public static INVALID_SESSION_GENID: string = "Sessions cannot be used because an ID Generator is missing";
    public static INVALID_SESSION_STORAGE_INSTANCE: string = "Sessions cannot be used because an storage instance is missing";
    public static INVALID_COMPONENT_CONTEXT: string = "Component context is invalid or missing";
    public static NEEDED_RESOURCE_HANDLER_LOCATION: string = "Resource Handler failed to obtain resource since it's lacking a resource handler location";
    public static INVALID_ROUTE_SIGNATURE_NULL: string = "The signature of the route is null which is invalid in the current context";
    public static INVALID_MICROSERVICE_CONFIGURATION: string = "Microservice component has been found but it lacks a proper configuration";

    constructor(public message: string, public superAlert: boolean = false) {
      super(message);
      this.name = "MandarineException";
      this.stack = (this).stack;
    }
  
}