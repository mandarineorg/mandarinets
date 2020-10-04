// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { decoder } from "https://deno.land/std@0.71.0/encoding/utf8.ts";
import type { Cookies as OakCookies, Request } from "../../deps.ts";
import { Log } from "../../logger/log.ts";
import { Mandarine } from "../Mandarine.ns.ts";
import { CommonUtils } from "./commonUtils.ts";

export class HttpUtils {

    public static async parseBody(request: Request): Promise<any> {
        const body = await Deno.readAll(request.serverRequest.body);
        let decodedBody: string = decoder.decode(body);
        let contentType = request.serverRequest.headers.get("content-type");
        if(contentType) {
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
                    return this.handleMultipartFormData(body, <string> request.serverRequest.headers.get("content-type"));
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
        } else {
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
            if(!(cookieKey != null)) continue;
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

    public static handleMultipartFormData(body: any, contentType: string): Mandarine.MandarineMVC.MultipartFormData {
        let multipartBoundary = contentType?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    
        if ( !multipartBoundary ) {
            throw new Error('Bad content-type header, no multipart boundary');
        }
    
        let boundary: any = multipartBoundary[1] || multipartBoundary[2];
    
        function headerParser(header: string): Mandarine.MandarineMVC.MultipartHeader | undefined {
            const nameMatchResult = header.match(/^.*name="([^"]*)"$/);
            const filenameMatchResult = header.match(/^.*filename="([^"]*)"$/);
            if(nameMatchResult == (null || undefined)) return undefined;
            if(nameMatchResult && !filenameMatchResult) {
                return {
                    name: nameMatchResult[1],
                    isFile: false
                };
            } else if(nameMatchResult && filenameMatchResult) {
                return {
                    name: filenameMatchResult[1],
                    isFile: true
                };
            }
            return undefined;
        }
    
        function rawStringToBuffer(str: string) {
            let idx: number;
            const len = str.length;
            let arr = new Array(len);
            for (idx = 0;idx < len; ++idx) {
                arr[idx] = str.charCodeAt(idx) & 0xFF;
            }
            return new Uint8Array(arr).buffer;
        }
    
        // \r\n is part of the boundary.
        boundary = '\r\n--' + boundary;
    
        var isRaw = typeof(body) !== 'string';
        let s: string;
        if (isRaw) {
            var view = new Uint8Array(body);
            s = String.fromCharCode.apply(null, <any> view);
        } else {
            s = body;
        }
    
        // Prepend what has been stripped by the body parsing mechanism.
        s = '\r\n' + s;
    
        const parts = s.split(new RegExp(boundary));
        let partsByName: Mandarine.MandarineMVC.MultipartFormData = {
            files: {},
            fields: {}
        };
    
        // First part is a preamble, last part is closing '--'
        for (var i=1; i<parts.length-1; i++) {
          let field: Mandarine.MandarineMVC.MultipartHeader | undefined = undefined;
    
          const subparts = parts[i].split('\r\n\r\n');
          const headers = subparts[0].split('\r\n');
    
          for (let j=1; j<headers.length; j++) {
            const headerFields = headerParser(headers[j]);
            if (headerFields && headerFields.name) {
                field = headerFields;
            }
          }
          if(field && field.name) {
              if(partsByName.files && partsByName.fields) {
                if(field.isFile) {
                    let buffer = rawStringToBuffer(subparts[1]);
                    partsByName.files[field.name] = new Uint8Array(<any> buffer);
                } else {
                    partsByName.fields[field.name] = subparts[1];
                }
            }
          }
        }
        return partsByName;
    }

    public static createCookie(requestContext: Mandarine.Types.RequestContext, cookieData: Mandarine.MandarineMVC.Cookie): string | undefined {
        const cookiesFromRequest: Mandarine.MandarineCore.Cookies = HttpUtils.getCookies(requestContext.request);
        let cookiesNames: Array<string> = Object.keys(cookiesFromRequest);
        let cookieExists: boolean = cookiesNames.some((cookieName) => cookieName === cookieData.name);
        const cookieName = cookiesNames.find((cookieName) => cookieName === cookieData.name);
        let isCookieValid = true;

        if(cookieExists && cookieName) { 
            const currentCookie = cookiesFromRequest[cookieName];
            isCookieValid = requestContext.cookies.get(cookieName, { signed: true }) != undefined;
        }

        if(!isCookieValid || isCookieValid && !cookieExists) {
            let cookieConfig: any = {};
            if(cookieData.domain) cookieConfig.domain = cookieData.domain;
            if(cookieData.expires) cookieConfig.expires = cookieData.expires;
            if(cookieData.maxAge) cookieConfig.maxAge = cookieData.maxAge;
            if(cookieData.path) cookieConfig.path = cookieData.path;
            if(cookieData.secure) cookieConfig.secure = cookieData.secure;
            if(cookieData.sameSite) cookieConfig.sameSite = cookieData.sameSite;
            cookieConfig.signed = true;
            cookieConfig.httpOnly = (cookieData.httpOnly) ? cookieData.httpOnly : false;

            const cookies = requestContext.cookies.set(cookieData.name, cookieData.value, cookieConfig);
            return cookieData.value;
        }

        if(cookieExists && cookieName) {
            return cookiesFromRequest[cookieName];
        }
    }

    public static assignContentType(context: Mandarine.Types.RequestContext) {
        let contentType: string = Mandarine.Global.getMandarineConfiguration().mandarine.server.responseType;

        const responseBody = context.response.body;
        if(responseBody != (null || undefined)) {
           if(CommonUtils.isObject(responseBody) || Array.isArray(responseBody)) {
                contentType = Mandarine.MandarineMVC.MediaTypes.APPLICATION_JSON;
           }
        }
        
        context.response.headers.set('Content-Type', contentType);
    }
    
}