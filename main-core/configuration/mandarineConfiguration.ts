export type MandarineConfiguration = {
    mandarine: {
        server: {
            host?: string,
            port: number
        }
    }
};

export const MandarineDefaultConfiguration: MandarineConfiguration = {
    mandarine: {
        server: {
            host: "0.0.0.0",
            port: 4444
        }
    }
};