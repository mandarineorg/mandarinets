import { Log } from "../logger/log.ts";
import { MandarineMVC } from "../mvc-framework/mandarineMVC.ts";
import { ApplicationContext } from "./application-context/mandarineApplicationContext.ts";
import { MandarineTSFrameworkEngineMethods } from "./engine/mandarineTSFrameworkEngineMethods.ts";
import { Mandarine } from "./Mandarine.ns.ts";
import { MandarineLoading } from "./mandarineLoading.ts";

/**
 * Contains core methods & information related to Mandarine
 */
export class MandarineCore {
    public static releaseVersion: string = "1.1.1";
    
    public static logger: Log = Log.getLogger(MandarineCore);

    constructor(showLoading?: boolean) {
        if(showLoading === undefined || showLoading === true) {
            MandarineLoading();
        }

        // ORDER OF THINGS MATTER
        // If the repository proxy is resolved after the dependencies, then the dependencies will have an empty repository
        this.resolveRepositoriesProxy();
        this.resolveComponentsDependencies();

        MandarineTSFrameworkEngineMethods.initializeEngineMethods();

        this.initializeControllers();
        this.initializeTemplates();
        this.initializeEntityManager();
    }

    private resolveComponentsDependencies(): void {
        ApplicationContext.getInstance().getComponentsRegistry().resolveDependencies();
    }

    private resolveRepositoriesProxy(): void {
        ApplicationContext.getInstance().getComponentsRegistry().connectRepositoriesToProxy();
    }

    private initializeControllers() {
        ApplicationContext.getInstance().getComponentsRegistry().initializeControllers();
    }

    private initializeTemplates() {
        ApplicationContext.getInstance().getTemplateManager().initializeTemplates();
    }

    private initializeEntityManager() {
        let entityManager = ApplicationContext.getInstance().getEntityManager();
        if(entityManager.getDataSource() != undefined) {
            entityManager.initializeEssentials();
            entityManager.initializeAllEntities();
        }
    }

    public MVC() {
        return new MandarineMVC();
    }

    /**
     * Sets a new configuration for mandarine.
     * @param configFilePath receives the path for the new configuration.json file
     * Configuration.json file should follow Mandarine properties structure.
     * https://mandarineframework.gitbook.io/mandarine-ts/mandarine-core/properties
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