// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineSecurityException extends Error {

  public static readonly INVALID_USER_DETAILS_SERVICE: string = "A UserDetailsService was introduced but it could not be started because it is either undefined or an invalid service. UserDetailsService must be a Mandarine-powered component";
  public static readonly UNSATISFIED_AUTHENTICATOR: string = "The current authenticator is unsatisfied. Password encoder or current `UserDetailsService` may be null or undefined";
  public static readonly INVALID_LOGIN_DATA: string = "Authentication could not be performed because the request contains either invalid or null data.";

    constructor(public message: string, public superAlert: boolean = false) {
      super(message);
      this.name = "MandarineSecurityException";
      this.stack = (this).stack;
    }
  
}