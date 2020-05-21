import { Mandarine } from "./Mandarine.ns.ts";

export class MandarineCore {
    public static releaseVersion: string = "1.0.0";

    public static async setConfiguration(configFilePath: string) {
        const decoder = new TextDecoder("utf-8");
        let readConfig = await Deno.readFile(configFilePath);
        let properties: Mandarine.Properties = JSON.parse(decoder.decode(readConfig));

        Mandarine.Global.setConfiguration(properties);
    }
}