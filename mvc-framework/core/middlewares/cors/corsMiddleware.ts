// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { HttpUtils } from "../../../../main-core/utils/httpUtils.ts";

const configureOrigin = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption, res: Mandarine.MandarineMVC.ResponseContext, requestOrigin: string) => {
    let allowOrigin = HttpUtils.verifyCorsOrigin(corsOptions.origin, requestOrigin);
    if(corsOptions.origin === "*") {
        res.headers.set("access-control-allow-origin", "*");
    } else {
        res.headers.set("access-control-allow-origin", allowOrigin ? requestOrigin : <any> false);
    }
}

const configureExposeHeaders = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption, res: Mandarine.MandarineMVC.ResponseContext) => {
    if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length > 0) {
        res.headers.set("access-control-expose-headers", corsOptions.exposedHeaders.join(", "));
    }
}

const configureCredentials = (corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption, res: Mandarine.MandarineMVC.ResponseContext) => {
    if (corsOptions.credentials) {
        res.headers.set("access-control-allow-credentials", "true");
    }
}

interface MiddlewareData {
    corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption,
    useDefaultCors: boolean
}

export const handleCors = (requestContext: Mandarine.Types.RequestContext, data: MiddlewareData): boolean => {
    let { corsOptions, useDefaultCors } = data;
    if(!corsOptions && useDefaultCors) corsOptions = Mandarine.Defaults.MandarineDefaultCorsOptions;

    let req = requestContext.request;
    let res = requestContext.response;
    const requestOrigin = req.headers.get("origin");

    if(requestContext.request.method === "OPTIONS") {
        if (!requestOrigin) return true;

        configureOrigin(corsOptions, res, requestOrigin);

        const requestMethods = req.headers.get("access-control-request-method");
        if (requestMethods && corsOptions.methods && corsOptions.methods.length > 0) {
            const list = requestMethods.split(",").map((v) => v.trim());
            const allowed = list.filter((v) => corsOptions.methods?.includes(v));
            res.headers.set("access-control-allow-methods", allowed.join(", "));
        }

        const requestHeaders = req.headers.get("access-control-request-headers");
        if (requestHeaders && corsOptions.allowedHeaders && corsOptions.allowedHeaders.length > 0) {
            const list = requestHeaders.split(",").map((v) => v.trim().toLowerCase());
            const allowed = list.filter((v) => corsOptions.allowedHeaders?.map((v) => v.toLowerCase()).includes(v));
            res.headers.set("access-control-allow-headers",allowed.join(", "));
        }

        configureExposeHeaders(corsOptions, res);

        configureCredentials(corsOptions, res);

        let finalMaxAge = `${(corsOptions.maxAge == (null || undefined)) ? 0 : corsOptions.maxAge}`;
        res.headers.set("access-control-max-age", finalMaxAge);
        
        res.status = (corsOptions.optionsSuccessStatus) ? corsOptions.optionsSuccessStatus : <any> Mandarine.MandarineMVC.HttpStatusCode.NO_CONTENT;
        return false;
    } else {
        configureOrigin(corsOptions, res, <string> requestOrigin);
        configureExposeHeaders(corsOptions, res);
        configureCredentials(corsOptions, res);
        return true;
    }
}

