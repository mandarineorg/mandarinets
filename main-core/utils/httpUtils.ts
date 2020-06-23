import { decoder } from "https://deno.land/std/encoding/utf8.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Request, FormDataReader } from "../../deps.ts";
import { Log } from "../../logger/log.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class HttpUtils {

    public static async parseBody(request: Request): Promise<any> {
        const body = await Deno.readAll(request.serverRequest.body);
        let decodedBody: string = decoder.decode(body);
        let contentType = request.serverRequest.headers.get("content-type");
        if(contentType.includes('multipart/form-data; boundary=')) contentType = "multipart/form-data";

        switch(contentType) {
            case "application/json":

                try {
                    return JSON.parse(decodedBody);
                } catch(error) {
                    new Log(HttpUtils).warn("Body could not be parsed");
                }

                break;
            
            case "multipart/form-data":
                let multipartBody = (await request.body()).value;
                console.log(await ((<FormDataReader> multipartBody)).read());
            break;

            case "application/x-www-form-urlencoded":
                let returningElements: {[key: string]: string} = {};
                for (const [key, value] of new URLSearchParams(decodedBody).entries()) {
                    returningElements[key] = value;
                }
                return returningElements;

            default:
                return body;
        }
    }

    public static getCookies(req: any): Mandarine.MandarineCore.Cookies {
        const cookie = req.headers.get("Cookie");
        if (cookie != null) {
          const out: Mandarine.MandarineCore.Cookies = {};
          const c = cookie.split(";");
          for (const kv of c) {
            const [cookieKey, ...cookieVal] = kv.split("=");
            assert(cookieKey != null);
            const key = cookieKey.trim();
            out[key] = cookieVal.join("=");
          }
          return out;
        }
        return {};
    }

    public static verifyCorsOrigin(origin: string | RegExp | Array<string | RegExp>, requestOrigin: string): boolean {
        if (typeof origin === "string") {
            return origin === requestOrigin;
        } else if (origin instanceof RegExp) {
            return requestOrigin.match(origin) != null;
        } else if (Array.isArray(origin)) {
            for(const originValue in origin) {
                if(this.verifyCorsOrigin(originValue, requestOrigin)) {
                    return true;
                }
            }
        }
        return false;
    }
    
}