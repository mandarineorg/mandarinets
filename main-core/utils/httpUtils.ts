import { Request } from "https://deno.land/x/oak/request.ts";
import { decoder } from "https://deno.land/std/encoding/utf8.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class HttpUtils {

    public static async parseBody(request: Request): Promise<any> {
        const body = await Deno.readAll(request.serverRequest.body);
        let decodedBody: string = decoder.decode(body);
        const contentType = request.serverRequest.headers.get("content-type");

        switch(contentType) {
            case "application/json":

                try {
                    return JSON.parse(decodedBody);
                } catch(error) {
                    // TODO
                }

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

    public static redirect(response: any): Function {
        // This is not good practice. No good design
        // This should be change as soon as Deno allows redirection natively.
        return (url: string) => {
            response.headers.append("Location", url);
            response.status = 302;
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
    
}