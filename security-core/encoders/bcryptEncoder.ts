// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Mandarine } from "../../main-core/Mandarine.ns.ts";
import * as BCrypt from "../hash/bcrypt/bcrypt.ts";

export class BcryptEncoder implements Mandarine.Security.Crypto.PasswordEncoder {

    private salt: string = BCrypt.gensalt();

    public encode(rawPassword: string): string {
        return BCrypt.hashpw(rawPassword, this.salt);
    }

    public matches(rawPassword: string, encodedPassword: string): boolean {
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }

}