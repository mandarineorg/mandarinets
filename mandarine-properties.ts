export type MandarineProperties = {
    mandarine: {
        server: {
            host?: string,
            port: number
        }
    }
};

export const MandarineDefaultConfiguration: MandarineProperties = {
    mandarine: {
        server: {
            host: "0.0.0.0",
            port: 4444
        }
    }
};