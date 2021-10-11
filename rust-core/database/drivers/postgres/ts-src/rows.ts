// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export interface Column {
    name: string,
    value: any,
    type: string
}

export type Row = Array<Column>;