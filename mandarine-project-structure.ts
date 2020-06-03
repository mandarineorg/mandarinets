import { Mandarine } from "./main-core/Mandarine.ns.ts";

export const structure = {
    folders: [
        "/test",
        "/src",
        "/src/main",
        "/src/main/mandarine",
        "/src/main/resources",
        "/src/main/resources/templates"
    ],
    files: {
        "/src/main/resources/properties.json": JSON.stringify(Mandarine.Defaults.MandarineDefaultConfiguration),
        "/src/main/mandarine/app.ts": `

        import { MandarineCore } from "https://deno.land/x/mandarinets/mod.ts";

        const services = [];
        const middleware = [];
        const repositories = [];
        const configurations = [];
        const components = [];
        const otherModules = [;
        
        new MandarineCore().MVC().run();
        `
    }
}