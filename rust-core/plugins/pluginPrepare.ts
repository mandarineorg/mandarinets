// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineConstants } from "https://raw.githubusercontent.com/mandarineorg/mandarinets/master/main-core/mandarineConstants.ts";

const mandarineTargetFolderName = MandarineConstants.MANDARINE_TARGET_FOLDER;
export type PluginExtension = "dylib" | "dll" | "so" | undefined;

export const getPluginInformation = (pluginNameIn: string): [string, PluginExtension] => {
    let pluginExtension: PluginExtension;
    let pluginNameOut: string = pluginNameIn;
    
    switch(Deno.build.os) {
        case "darwin":
            pluginExtension = "dylib"
            break;
        case "windows":
            pluginNameOut = pluginNameOut.replace("lib", "");
            pluginExtension = "dll";
            break;
        case "linux":
            pluginExtension = "so";
            break;
    }

    return [pluginNameOut, pluginExtension];
}

const pathExists = (path: string): boolean => {
    try {
        Deno.statSync(path);
        return true;
    } catch {
        return false;
    }
}

export const fetchPlugin = async (downloadBaseUrl: string, pluginNameIn: string): Promise<string> => {
    const [pluginName, pluginExtension] = getPluginInformation(pluginNameIn);

    const pluginFull = `${pluginName}.${pluginExtension}`;

    if(!pathExists(`./${mandarineTargetFolderName}`)) Deno.mkdirSync(mandarineTargetFolderName);

    const pluginPath = `./${mandarineTargetFolderName}/${pluginFull}`;

    if(!pathExists(pluginPath)) {
        const fetching = await fetch(`${downloadBaseUrl}/${pluginFull}`);
        const data = await fetching.arrayBuffer();
        Deno.writeFileSync(pluginPath, new Uint8Array(data), { 
            create: true
        });
    }

    return pluginPath;
}

export const getPluginPathInternal = (path: string, pluginNameIn: string) => {
    const [pluginName, pluginExtension] = getPluginInformation(pluginNameIn);
    return `${path}/target/release/${pluginName}.${pluginExtension}`;
}