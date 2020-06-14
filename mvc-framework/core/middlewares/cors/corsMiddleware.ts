import { Context } from "../../../../deps.ts";
import { Mandarine } from "../../../../main-core/Mandarine.ns.ts";
import { HttpUtils } from "../../../../main-core/utils/httpUtils.ts";

const configureOrigin = (corsOptions, res, requestOrigin) => {
    let allowOrigin = HttpUtils.verifyCorsOrigin(corsOptions.origin, requestOrigin);

    if(corsOptions.origin === "*") {
        res.headers.set("access-control-allow-origin", "*");
    } else {
        res.headers.set("access-control-allow-origin", allowOrigin ? requestOrigin : false);
    }
}

const configureExposeHeaders = (corsOptions, res) => {
    if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length > 0) {
        res.headers.set("accessl-control-expose-headers", corsOptions.exposedHeaders.join(", "));
    }
}

const configureCredentials = (corsOptions, res) => {
    if (corsOptions.credentials) {
        res.headers.set("access-control-allow-credentials", "true");
    }
}

export const handleCors = (requestContext: Context, corsOptions: Mandarine.MandarineMVC.CorsMiddlewareOption) => {
    if(!corsOptions) return;

    let req = requestContext.request;
    let res = requestContext.response;
    const requestOrigin = req.headers.get("origin");

    if(requestContext.request.method === "OPTIONS") {
        if (!requestOrigin) return;

        configureOrigin(corsOptions, res, requestOrigin);

        const requestMethods = req.headers.get("access-control-request-methods");
        if (requestMethods && corsOptions.methods && corsOptions.methods.length > 0) {
            const list = requestMethods.split(",").map((v) => v.trim());
            const allowed = list.filter((v) => corsOptions.methods.includes(v));
            res.headers.set("access-control-allow-methods", allowed.join(", "));
        }

        const requestHeaders = req.headers.get("access-control-request-headers");
        if (requestHeaders && corsOptions.allowedHeaders && corsOptions.allowedHeaders.length > 0) {
            const list = requestHeaders.split(",").map((v) => v.trim());
            const allowed = list.filter((v) => corsOptions.allowedHeaders.includes(v));
            res.headers.set("access-control-allow-headers",allowed.join(", "));
        }

        configureExposeHeaders(corsOptions, res);

        configureCredentials(corsOptions, res);

        res.headers.set("access-control-max-age", `${(corsOptions.maxAge == (null || undefined)) ? 0 : corsOptions.maxAge}`);
        res.status = <any> Mandarine.MandarineMVC.HttpStatusCode.NO_CONTENT;
    } else {
        configureOrigin(corsOptions, res, requestOrigin);
        configureExposeHeaders(corsOptions, res);
        configureCredentials(corsOptions, res);
    }
}

