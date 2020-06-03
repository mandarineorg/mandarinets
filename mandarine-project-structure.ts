import { CommonUtils } from "./main-core/utils/commonUtils.ts";

const mandarineDefaultConfig = CommonUtils.readFile('./defaults/config.json');

const mandarineDefaultAppFile = CommonUtils.readFile('./defaults/app.ts');

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
        "/src/main/resources/properties.json": mandarineDefaultConfig,
        "/src/main/mandarine/app.ts": mandarineDefaultAppFile
    }
};