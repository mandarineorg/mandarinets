import { Mandarine } from "../Mandarine.ns.ts";

export const getMandarineConfiguration = (configuration?: Mandarine.Properties): Mandarine.Properties => {
    return Mandarine.Global.getMandarineConfiguration();
}