// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export namespace MandarineCommonInterfaces {
    export interface PipeTransform {
        transform: (value: any) => any;
    }
    export type Pipes = Array<PipeTransform> | PipeTransform;
}