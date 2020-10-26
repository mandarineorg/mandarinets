const mandarineTargetFolderName = "mandarine_target";
const pathExists = (path: string): boolean => {
    try {
        Deno.statSync(path);
        return true;
    } catch {
        return false;
    }
}
export const fetchPlugin = async (downloadBaseUrl: string, pluginName: string): Promise<string> => {
    let pluginExtension: "dylib" | "dll" | "so" | undefined = undefined;
    switch(Deno.build.os) {
        case "darwin":
            pluginExtension = "dylib"
            break;
        case "windows":
            pluginExtension = "dll";
            break;
        case "linux":
            pluginExtension = "so";
            break;
    }
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