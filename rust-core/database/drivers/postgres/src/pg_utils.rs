use crate::*;
use rust_decimal::prelude::ToPrimitive;
use serde_json::*;
#[derive(Serialize, Deserialize)]
pub struct ColumnData<N, V> {
    columnName: N,
    columnValue: V
}
use bit_vec::BitVec;

pub type PGParameters = dyn tokio_postgres::types::ToSql + Sync;

fn process_rect(value: geo_types::Rect<f64>) -> Map<String, Value> {
    let mut return_map: Map<String, Value> = Map::new();

    let mut min_cordinates: Map<String, Value> = Map::new();
    let mut max_cordinates: Map<String, Value> = Map::new();

    min_cordinates.insert("x".to_string(), json!(value.min.x));
    min_cordinates.insert("y".to_string(), json!(value.min.y));

    max_cordinates.insert("x".to_string(), json!(value.max.x));
    max_cordinates.insert("y".to_string(), json!(value.max.y));

    return_map.insert("min".to_string(), json!(min_cordinates));
    return_map.insert("max".to_string(), json!(max_cordinates));

    return_map
}

pub fn get_column_value(row: &tokio_postgres::Row, column: &tokio_postgres::Column, col_idx: usize) -> Value {
    let columnName = column.name();
    println!("{}", columnName);

    let mut current_value: Value = json!({
        "columnName": columnName,
        "columnValue": ""
    });
    
    println!("{}", column.type_().to_string());
    match column.type_().to_string().as_ref() {
        "smallint" | "int2" | "smallserial" | "serial2" => {
            let val: Option<i16> = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "int4" | "int" | "integer" | "serial" | "serial4" => {
            let val: Option<i32> = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "bigint" | "int8" | "bigserial" | "serial8" => {
            let val: Option<i64> = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "real" | "float4" => {
            let val: Option<f32>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "float8" => {
            let val: Option<f64>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "numeric" => {
            let val: rust_decimal::Decimal = row.get(col_idx);
            let val = val.to_f64();
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        }
        "varchar" | "character varying" | "text" | "citext" | "name" | "unknown" | "bpchar" => {
            let val: Option<String>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "bytea" => {
            let val: Option<Vec<u8>>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "bool" | "boolean" => {
            let val: Option<bool>  = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => val.into(),
                None => Value::Null
            };
        },
        "money" => {
            let val: Option<types::Money> = row.get(col_idx);

            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => (val.value()).into(),
                None => Value::Null
            };

        },
        "bit" | "varbit" => {
            let val: Option<BitVec> = row.get(col_idx);

            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => (val.to_bytes()).into(),
                None => Value::Null
            };
        },
        "box" => {
            let val: Option<geo_types::Rect<f64>> = row.get(col_idx);

            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => (process_rect(val)).into(),
                None => Value::Null
            };
        },
        "cidr" => {
            let val: Option<types::Cidr> = row.get(col_idx);
            *current_value.pointer_mut("/columnValue").unwrap() = match val {
                Some(val) => {
                    match val.ip() {
                        Some(ipd) => {
                            match ipd {
                                ipnetwork::IpNetwork::V4(ip) => (ip.to_string()).into(),
                                ipnetwork::IpNetwork::V6(ip) => (ip.to_string()).into()
                            }
                        },
                        None => Value::Null
                    }
                },
                None => Value::Null
            };
        }
        _ => {
            *current_value.pointer_mut("/columnValue").unwrap() = Value::Null
        }
    }

    current_value.clone()
}