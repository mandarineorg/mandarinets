use crate::*;
use rust_decimal::prelude::ToPrimitive;
use serde_json::*;
use std::result::{Result as StdResult};
use tokio_postgres::Error;
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

pub fn get_column_value(row: &tokio_postgres::Row, column: &tokio_postgres::Column, col_idx: usize) -> StdResult<Value, String> {
    let get_row_error_msg= "An error has occurred while trying to get column".to_string();
    let columnName = column.name();
    println!("{}", columnName);

    let mut current_value: Value = json!({
        "columnName": columnName,
        "columnValue": ""
    });

    let mut with_error: Option<String> = None;

    println!("{}", column.type_().to_string());
    match column.type_().to_string().as_ref() {
        "smallint" | "int2" | "smallserial" | "serial2" => {
            let val: StdResult<Option<i16>, Error> = row.try_get(col_idx);
            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "int4" | "int" | "integer" | "serial" | "serial4" => {
            let val: StdResult<Option<i32>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "bigint" | "int8" | "bigserial" | "serial8" => {
            let val: StdResult<Option<i64>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "real" | "float4" => {
            let val: StdResult<Option<f32>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "float8" => {
            let val: StdResult<Option<f64>, Error>  = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "numeric" => {
            let val: StdResult<Option<rust_decimal::Decimal>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let value: f64 = val.to_f64().unwrap();
                        value.into()
                    },
                    None => Value::Null
                };
            }
        }
        "varchar" | "character varying" | "text" | "citext" | "name" | "unknown" | "bpchar" => {
            let val: StdResult<Option<String>, Error> = row.try_get(col_idx);
            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "bytea" => {
            let val: StdResult<Option<Vec<u8>>, Error>  = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "bool" | "boolean" => {
            let val: StdResult<Option<bool>, Error>  = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "money" => {
            let val: StdResult<Option<types::Money>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.value().into(),
                    None => Value::Null
                };
            }

        },
        "bit" | "varbit" => {
            let val: StdResult<Option<BitVec>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_bytes().into(),
                    None => Value::Null
                };
            }
        },
        "box" => {
            let val: StdResult<Option<geo_types::Rect<f64>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => process_rect(val).into(),
                    None => Value::Null
                };
            }
        },
        "cidr" => {
            let val: StdResult<Option<types::Cidr>, Error> = row.try_get(col_idx);
            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
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
        },
        "circle" => {
            let val: StdResult<Option<types::Circle>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "date" => {
            let val: StdResult<Option<time::Date>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let date_format = format!("{}-{}-{}", val.year(), val.month(), val.day());
                        date_format.into()
                    },
                    None => Value::Null
                };
            }
        },
        _ => {
            *current_value.pointer_mut("/columnValue").unwrap() = Value::Null
        }
        
    }

    if with_error.is_none() {
        Ok(current_value.clone())
    } else {
        Err(with_error.unwrap())
    }
    
}