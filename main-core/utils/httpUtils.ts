import { Request } from "https://deno.land/x/oak/request.ts";
import { decoder } from "https://deno.land/std@v1.0.0-rc1/encoding/utf8.ts";
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
            response.body = `<script>location.href='${url}'</script>`;
        }
    }
    
}