// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { expandGlobSync } from "https://deno.land/std@0.62.0/fs/mod.ts";
import { readLines } from "https://deno.land/std@0.62.0/io/mod.ts";
import { MandarineConstants } from "../main-core/mandarineConstants.ts";
import { CommonUtils } from "../main-core/utils/commonUtils.ts";
import { Test } from "./mod.ts";

export class CopyrightTest {

    @Test({
        name: "Check copyright",
        description: "Verify all files have the copyright header"
    })
    public async checkCopyright() {

        const files: Array<string> = new Array<string>();

        for(const pattern of MandarineConstants.MANDARINE_FILE_GLOBS) {
            for (const file of expandGlobSync(pattern)) {
                files.push(file.path);
            }
        }

        for(let i = 0; i<files.length; i++) {
            let filePath = files[i];
            let fileReader = await Deno.open(filePath);
            let fileLines = (await CommonUtils.asyncIteratorToArray(readLines(fileReader)));
            fileReader.close();

            if(!fileLines[0].includes(MandarineConstants.MANDARINE_COPYRIGHT_HEADER)) {
                throw new Error(`File ${filePath} does not have Mandarine copyright headers. You must include ${MandarineConstants.MANDARINE_COPYRIGHT_HEADER} in the first line of your file.`);
            }

        }

    }

}