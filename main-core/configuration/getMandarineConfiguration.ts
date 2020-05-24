import { Mandarine } from "../Mandarine.ns.ts";

/**
* Get configuration of Mandarine.
*/
export const getMandarineConfiguration = (): Mandarine.Properties => {
    return Mandarine.Global.getMandarineConfiguration();
}