import { v4 } from "https://deno.land/std/uuid/mod.ts";

export class CommonUtils {
    public static generateUUID(): string {
        return v4.generate();
    }

    public static compareObjectKeys(a, b): boolean {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    public static readFile(filePath: string, decoderType?: string): any {
        if(decoderType == (null || undefined)) decoderType = "utf-8";

        let decoder;
        try {
            decoder = new TextDecoder(decoderType);
        } catch(error) {
            decoder = new TextDecoder();
        }

        const data = Deno.readFileSync(filePath);
        return decoder.decode(data);
    }

    public static fileDirExists(path: string): boolean  {
        try {
          Deno.statSync(path);
          return true;
        } catch (error) {
          return false;
        }
    }
}