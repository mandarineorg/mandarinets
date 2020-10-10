// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { BcryptEncoder } from "../../../security-core/encoders/bcryptEncoder.ts";
import { ApplicationContext } from "../../application-context/mandarineApplicationContext.ts";
import { MandarineSecurityException } from "../../exceptions/mandarineSecurityException.ts";
import type { Mandarine } from "../../Mandarine.ns.ts";

/**
 * The `AuthenticationManagerBuilder` class is responsible for handling two necessary properties in order for Mandarine built-in auth to work.
 * `userDetails` & `passwordEncoder` are required. By using such methods, you are able to plug in the implementations that will be used by Mandarine to execute authentication.
 */
export class AuthenticationManagerBuilder implements Mandarine.Security.Auth.AuthenticationManagerBuilder {
    private _userDetailsServiceType = undefined;
    private _passwordEncoder: Mandarine.Security.Crypto.PasswordEncoder = new BcryptEncoder();

    public userDetailsService(userdetailsServiceType: any): AuthenticationManagerBuilder {
        if(!userdetailsServiceType) throw new MandarineSecurityException(MandarineSecurityException.INVALID_USER_DETAILS_SERVICE);
        if(!userdetailsServiceType.prototype.loadUserByUsername) throw new MandarineSecurityException(MandarineSecurityException.USER_DETAILS_SERVICE_INCOMPLETE);

        this._userDetailsServiceType = userdetailsServiceType;
        return this;
    }

    public passwordEncoder(passwordEncoderImpl: Mandarine.Security.Crypto.PasswordEncoder): AuthenticationManagerBuilder {
        if(!passwordEncoderImpl) throw new Error("A password encoder implementation must not be defined");
        this._passwordEncoder = passwordEncoderImpl;
        return this;
    }

    public getUserDetailsService() {
        return ApplicationContext.getInstance().getDIFactory().getDependency(this._userDetailsServiceType);
    }

    public getPasswordEncoder(): Mandarine.Security.Crypto.PasswordEncoder {
        return this._passwordEncoder;
    }

}