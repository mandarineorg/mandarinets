import { bold, magenta, green, yellow, red } from "https://deno.land/std@v1.0.0-rc1/fmt/colors.ts";
export class Log {

    private className: string = null;

    constructor(source: any) {
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

    public static getLogger(source: any) {
        return new Log(source);
    }
}