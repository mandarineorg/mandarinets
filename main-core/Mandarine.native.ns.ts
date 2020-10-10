// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { WebMVCConfigurer } from "./mandarine-native/mvc/webMvcConfigurer.ts";

export namespace MandarineNative {
    /**
     * Responsible for handling internal behaviors related to the MVC Core.
     * With `WebMvcConfigurer` you may configure the behavior of functionalities such as:
     * - Built-in authentication
     * - Resource Handlers
     * - Session containers
     * - ...
     */
    export class WebMvcConfigurer extends WebMVCConfigurer {}
}