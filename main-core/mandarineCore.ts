import { Mandarine } from "./Mandarine.ns.ts";
import { Log } from "../logger/log.ts";

export class MandarineCore {
    public static releaseVersion: string = "1.0.0";
    public static logger: Log = Log.getLogger(MandarineCore);

    public static setConfiguration(configFilePath: string) {
        try {
            const decoder = new TextDecoder("utf-8");
            let readConfig = Deno.readFileSync(configFilePath);
            let properties: Mandarine.Properties = JSON.parse(decoder.decode(readConfig));
            Mandarine.Global.setConfiguration(properties);
        } catch {
            this.logger.warn("Configuration could not be parsed, default values will be used.");
        }
    }
}