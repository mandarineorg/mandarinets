import { bold, green, magenta, red, yellow } from "https://deno.land/std/fmt/colors.ts";

export interface LogOptions {
    logDuringTesting: string;
}

export class Log {

    private className: string = null;
    public logOptions: LogOptions;

    constructor(source: any | string, options?: LogOptions) {
        this.logOptions = options;
        if(typeof source === 'string') {
            this.className = <string> source + ".class";
            return;
        }
        try {
            this.className = source.prototype.constructor.name + ".class";
        }catch(error) {
            this.className = "unknown";
        }
    }

    public debug(msg: string, ...supportingDetails: any[]): void {
        this.emitLogMessage("debug", msg, supportingDetails);
    }

    public info(msg: string, ...supportingDetails: any[]): void {
        this.emitLogMessage("info", msg, supportingDetails);
    }

    public warn(msg: string, ...supportingDetails: any[]): void {
        this.emitLogMessage("warn", msg, supportingDetails);
    }

    public error(msg: string, ...supportingDetails: any[]): void {
        this.emitLogMessage("error", msg, supportingDetails);
    }

    private emitLogMessage(msgType: "debug" | "info" | "warn" | "error", msg: string, supportingDetails: any[]) {
        
        if(this.logOptions && this.logOptions.logDuringTesting === "false") return;

        let finalMessage: string = null;

        switch(msgType) {
            case "debug":
                finalMessage = `${magenta(bold(`[${msgType.toUpperCase()} | ${new Date().toLocaleString()}]`))} [${Deno.pid}] [${this.className}] ${msg}`;
            break;
            case "info":
                finalMessage = `${green(bold(`[${msgType.toUpperCase()} | ${new Date().toLocaleString()}]`))} [${Deno.pid}] [${this.className}] ${msg}`;
            break;
            case "warn":
                finalMessage = `${yellow(bold(`[${msgType.toUpperCase()} | ${new Date().toLocaleString()}]`))} [${Deno.pid}] [${this.className}] ${msg}`;
            break;
            case "error":
                finalMessage = `${red(bold(`[${msgType.toUpperCase()} | ${new Date().toLocaleString()}]`))} [${Deno.pid}] [${this.className}] ${msg}`;
            break;
        }

        if(supportingDetails.length > 0) console[msgType](finalMessage, supportingDetails);
        else console[msgType](finalMessage);
    }

    public static getLogger(source: any, options?: LogOptions) {
        return new Log(source, options);
    }
}