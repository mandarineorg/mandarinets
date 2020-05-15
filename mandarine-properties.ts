import { MediaTypes } from "./mvc-framework/core/enums/http/httpMediaTypes.ts";

export type MandarineProperties = {
    mandarine: {
        server: {
            host?: string,
            port: number,
            responseType?: MediaTypes
        }
    }
};

export const MandarineDefaultConfiguration: MandarineProperties = {
    mandarine: {
        server: {
            host: "0.0.0.0",
            port: 4444,
            responseType: MediaTypes.TEXT_HTML
        }
    }
};