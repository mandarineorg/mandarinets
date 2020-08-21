// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";

export class MandarineAuthenticationException extends Error {

      constructor(public message: string, public authException: Mandarine.Security.Auth.AuthExceptions) {
        super(message);
        this.name = "MandarineAuthenticationException";
        this.stack = (this).stack;
      }
    
  }