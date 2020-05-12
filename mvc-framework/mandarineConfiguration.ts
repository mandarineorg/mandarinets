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
            port: 4444
        }
    }
};