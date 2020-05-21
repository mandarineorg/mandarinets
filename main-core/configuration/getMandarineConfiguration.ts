import { Mandarine } from "../Mandarine.ns.ts";

export const getMandarineConfiguration = (): Mandarine.Properties => {
    return Mandarine.Global.getMandarineConfiguration();
}