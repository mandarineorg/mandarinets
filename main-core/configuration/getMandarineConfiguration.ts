import { MandarineConfiguration, MandarineDefaultConfiguration } from "./mandarineConfiguration.ts";

export const getMandarineConfiguration = (configuration?: MandarineConfiguration) => {
    if (!(window as any).mandarineMVCConfiguration)
    (window as any).mandarineMVCConfiguration = (configuration == (null || undefined)) ? MandarineDefaultConfiguration : configuration;

    return (window as any).mandarineMVCConfiguration;
}