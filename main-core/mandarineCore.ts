import { Mandarine } from "./Mandarine.ns.ts";

export class MandarineCore {
    public static releaseVersion: string = "1.0.0";

    public static setConfiguration(configFilePath: string) {
        const decoder = new TextDecoder("utf-8");
        let readConfig = Deno.readFileSync(configFilePath);
        let properties: Mandarine.Properties = JSON.parse(decoder.decode(readConfig));
        Mandarine.Global.setConfiguration(properties);
    }
}