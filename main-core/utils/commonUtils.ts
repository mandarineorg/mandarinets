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
}