import { Configuration } from "./configuration.ts";

export const getMandarineConfiguration = (configuration?: Configuration) => {
    if (!(window as any).mandarineMVCConfiguration)
    (window as any).mandarineMVCConfiguration = (configuration == (null || undefined)) ? new Configuration() : configuration;

    return (window as any).mandarineMVCConfiguration;
}