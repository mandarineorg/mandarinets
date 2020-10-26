export interface Column {
    name: string,
    value: any,
    ctype: string
}

export type Row = Array<Column>;