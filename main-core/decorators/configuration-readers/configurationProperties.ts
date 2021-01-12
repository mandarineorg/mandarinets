// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MainCoreDecoratorProxy } from "../../proxys/mainCoreDecorator.ts";

/**
 * **Decorator**
 * Defines what configuration file component will be using.
 *
 * `@ConfigurationProperties('./src/config/myconfig.json')`
 */
export const ConfigurationProperties = (path: string) => {
    return (target: any) => {
        MainCoreDecoratorProxy.configurationPropertiesDecorator(target, path);
    }
}