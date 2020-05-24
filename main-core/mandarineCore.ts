import { Mandarine } from "./Mandarine.ns.ts";
import { Log } from "../logger/log.ts";

/**
 * Contains core methods & information related to Mandarine
 */
export class MandarineCore {
    public static releaseVersion: string = "1.0.0";
    public static logger: Log = Log.getLogger(MandarineCore);

    /**
     * Sets a new configuration for mandarine.
     * @param configFilePath receives the path for the new configuration.json file
     * Configuration.json file should follow Mandarine properties structure.
     * https://github.com/mandarineorg/mandarinets/wiki/Mandarine-Properties
     * If structure is ignored, some properties may be set to their default values
     */
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