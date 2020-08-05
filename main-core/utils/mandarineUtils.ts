// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../Mandarine.ns.ts";
import { MandarineException } from "../exceptions/mandarineException.ts";

export class MandarineUtils {

    public static readonly NEWLINE: string = '\n';
    public static readonly RE_INI_KEY_VAL: RegExp = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
    public static readonly RE_NEWLINES: RegExp = /\\n/g;
    public static readonly NEWLINES_MATCH: RegExp = /\n|\r|\r\n/;

    public static parseConfigurationFile(src: string): Mandarine.IniFile {
        const obj = {};
      
        src.split(this.NEWLINES_MATCH).forEach((line, idx) => {
            const keyValueArr = line.match(this.RE_INI_KEY_VAL);
            if (keyValueArr != null) {
                const key = keyValueArr[1];
                let val = (keyValueArr[2] || '');
                const end = val.length - 1;
                const isDoubleQuoted = val[0] === '"' && val[end] === '"';
                const isSingleQuoted = val[0] === "'" && val[end] === "'";
        
                if (isSingleQuoted || isDoubleQuoted) {
                    val = val.substring(1, end);
                    if (isDoubleQuoted) val = val.replace(this.RE_NEWLINES, this.NEWLINE);
                } else {
                    val = val.trim();
                }

                obj[key] = val;
            }
        })
      
        return obj;
    }

    public static reThrowError(error: Error) {
        if(error instanceof MandarineException) {
            if(error.superAlert) {
                throw error;
            }
        }
    }
}