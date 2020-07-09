// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";

/**
* Get configuration of Mandarine.
*/
export const getMandarineConfiguration = (): Mandarine.Properties => {
    return Mandarine.Global.getMandarineConfiguration();
}