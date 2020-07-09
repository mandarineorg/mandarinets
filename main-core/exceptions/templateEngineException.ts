// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class TemplateEngineException extends Error {

    public static INVALID_TEMPLATE_PROCESSING: string = "The template could not be read because it has not been initialized or it is not valid.";
    public static INVALID_ENGINE: string = "The template could not be processed because the engine is not recognizable by Mandarine";
  
    constructor(public message: string) {
      super(message);
      this.name = "TemplateEngineException";
      this.stack = (this).stack;
    }
  
}