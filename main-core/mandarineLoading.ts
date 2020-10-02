// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { rgb8 } from "https://deno.land/std@0.71.0/fmt/colors.ts";
import { Log } from "../logger/log.ts";
import { MandarineConstants } from "./mandarineConstants.ts";

/**
 * Loads the visualization of Mandarine's Compiler
 */
export const MandarineLoading = () => {
    console.log(`  __  __                 _            _              _______ _____ `);
    console.log(` |  \\/  |               | |          (_)            |__   __/ ____|`);
    console.log(` | \\  / | __ _ _ __   __| | __ _ _ __ _ _ __   ___     | | | (___  `);
    console.log(" | |\\/| |/ _` | '_ \\ / _` |/ _` | '__| | '_ \\ / _ \\    | |  \\___ \\ ");
    console.log(" | |  | | (_| | | | | (_| | (_| | |  | | | | |  __/    | |  ____) |");
    console.log(" |_|  |_|\\__,_|_| |_|\\__,_|\\__,_|_|  |_|_| |_|\\___|    |_| |_____/ ");
    console.log("                                                                   ");
    console.log(" ================================================================= ");
    console.log(` ${rgb8("Mandarine.TS Framework", 208)} :: ${MandarineConstants.RELEASE_VERSION}`);
    console.log("");
    Log.getLogger("MandarineCore").info(`Starting framework with PID ${Deno.pid}`);
    
};