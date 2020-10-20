use crate::*;
use std::collections::*;

use serde_json::*;

#[derive(Serialize, Deserialize)]
pub struct ColumnData<N, V> {
    columnName: N,
    columnValue: V
}

pub enum PGValue {
    Null,
    I64(i64),
    U64(u64),
    ARRAY(Vec<PGValue>),
    STRING(String),
    F64(f64),
    BOOLEAN(bool),
    Object(Map<String, Value>)
}

pub fn get_column_value(row: &tokio_postgres::Row, column: &tokio_postgres::Column, col_idx: usize) -> Value {
    let columnName = column.name();
    println!("{}", columnName);

    let mut current_value: Value = json!({
        "columnName": columnName,
        "columnValue": ""
    });

    match column.type_().to_string().as_ref() {
        "smallint" | "int2" | "smallserial" | "serial2" => {
            let val: i16 = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "int4" | "int" | "integer" | "serial" | "serial4" => {
            let val: i32 = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "bigint" | "int8" | "bigserial" | "serial8" => {
            let val: i64 = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "real" | "float4" => {
            let val: f32  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "float8" => {
            let val: f64  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "varchar" | "character varying" | "text" | "citext" | "name" | "unknown" => {
            let val: String  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "bytea" => {
            let val: Vec<u8>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        "bool" | "boolean" => {
            let val: bool  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.into();
        },
        _ => {
            let val: String  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = val.to_string().into();
        }
    }

    current_value.clone()
}