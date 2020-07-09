// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { ComponentsRegistryUtil } from "../components-registry/componentRegistry.util.ts";
import { Mandarine } from "../Mandarine.ns.ts";

export class ComponentUtils {

    public static createControllerComponent(configuration: any, classHandler: any) {
        ComponentsRegistryUtil.registerComponent(classHandler, Mandarine.MandarineCore.ComponentTypes.CONTROLLER, configuration, null);
    }

}