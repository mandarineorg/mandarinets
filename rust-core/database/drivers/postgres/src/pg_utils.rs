use crate::*;
use rust_decimal::prelude::ToPrimitive;
use serde_json::*;
use std::result::{Result as StdResult};
use tokio_postgres::Error;
use std::collections::HashMap;
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
        "_smallint" | "_int2" | "_smallserial" | "_serial2" => {
            let val: StdResult<Option<Vec<i16>>, Error> = row.try_get(col_idx);
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
        "_int4" | "_int" | "_integer" | "_serial" | "_serial4" => {
            let val: StdResult<Option<Vec<i32>>, Error> = row.try_get(col_idx);

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
        "_bigint" | "_int8" | "_bigserial" | "_serial8" => {
            let val: StdResult<Option<Vec<i64>>, Error> = row.try_get(col_idx);

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
        "_real" | "_float4" => {
            let val: StdResult<Option<Vec<f32>>, Error> = row.try_get(col_idx);

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
        "_float8" => {
            let val: StdResult<Option<Vec<f64>>, Error>  = row.try_get(col_idx);

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
        },
        "_numeric" => {
            let val: StdResult<Option<Vec<rust_decimal::Decimal>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let value: Vec<f64> = val.iter().map(|value| value.to_f64().unwrap()).collect();
                        serde_json::to_value(value).unwrap()
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
        "_varchar" | "_character varying" | "_text" | "_citext" | "_name" | "_unknown" | "_bpchar" => {
            let val: StdResult<Option<Vec<String>>, Error> = row.try_get(col_idx);
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
        "_bytea" => {
            let val: StdResult<Option<Vec<Vec<u8>>>, Error>  = row.try_get(col_idx);

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
        "_bool" | "_boolean" => {
            let val: StdResult<Option<Vec<bool>>, Error>  = row.try_get(col_idx);

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
        "_money" => {
            let val: StdResult<Option<Vec<types::Money>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<f64> = val.iter().map(|current_value| current_value.value()).collect();
                        values.into()
                    },
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
        "_bit" | "_varbit" => {
            let val: StdResult<Option<Vec<BitVec>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Vec<u8>> = val.iter().map(|current_value| current_value.to_bytes()).collect();
                        values.into()
                    },
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
        "_box" => {
            let val: StdResult<Option<Vec<geo_types::Rect<f64>>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| process_rect(*current_value).into()).collect();
                        serde_json::to_value(values).unwrap()
                    },
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
        "_cidr" => {
            let val: StdResult<Option<Vec<types::Cidr>>, Error> = row.try_get(col_idx);
            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| match current_value.ip() {
                            Some(ipd) => {
                                match ipd {
                                    ipnetwork::IpNetwork::V4(ip) => (ip.to_string()).into(),
                                    ipnetwork::IpNetwork::V6(ip) => (ip.to_string()).into()
                                }
                            },
                            None => Value::Null
                        }).collect();

                        values.into()
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
        "_circle" => {
            let val: StdResult<Option<Vec<types::Circle>>, Error> = row.try_get(col_idx);

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
        "_date" => {
            let val: StdResult<Option<Vec<time::Date>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| {
                        let date_format = format!("{}-{}-{}", current_value.year(), current_value.month(), current_value.day());
                        date_format.into()
                        }).collect();

                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "inet" => {
            let val: StdResult<Option<std::net::IpAddr>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_string().into(),
                    None => Value::Null
                };
            }
        },
        "_inet" => {
            let val: StdResult<Option<Vec<std::net::IpAddr>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_string().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "json" | "jsonb" => {
            let val: StdResult<Option<serde_json::Value>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val,
                    None => Value::Null
                };
            }
        },
        "_json" | "_jsonb" => {
            let val: StdResult<Option<Vec<serde_json::Value>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.into(),
                    None => Value::Null
                };
            }
        },
        "line" | "lseg" => {
            let val: StdResult<Option<types::Line>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "_line" | "_lseg" => {
            let val: StdResult<Option<Vec<types::Line>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "macaddr" => {
            let val: StdResult<Option<eui48::MacAddress>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_canonical().into(),
                    None => Value::Null
                };
            }
        },
        "_macaddr" => {
            let val: StdResult<Option<Vec<eui48::MacAddress>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_canonical().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "path"  => {
            let val: StdResult<Option<geo_types::LineString<f64>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        val.into_points().iter().map(|point| serde_json::to_value(types::Point::new(point.x(), point.y())).unwrap()).collect()
                    },
                    None => Value::Null
                };
            }
        },
        "pg_lsn"  => {
            let val: StdResult<Option<types::PgLsn>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.value().into(),
                    None => Value::Null
                };
            }
        },
        "_pg_lsn"  => {
            let val: StdResult<Option<Vec<types::PgLsn>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.value().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "point" => {
            let val: StdResult<Option<geo_types::Point<f64>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => (types::Point::new(val.x(), val.y())).json(),
                    None => Value::Null
                };
            }
        },
        "_point" => {
            let val: StdResult<Option<Vec<geo_types::Point<f64>>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| {
                        (types::Point::new(current_value.x(), current_value.y())).json()
                        }).collect();

                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "timestamptz" => {
            let val: StdResult<Option<chrono::DateTime<chrono::Utc>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_string().into(),
                    None => Value::Null
                };
            }
        },
        "_timestamptz" => {
            let val: StdResult<Option<Vec<chrono::DateTime<chrono::Utc>>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_string().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "timestamp" => {
            let val: StdResult<Option<chrono::NaiveDateTime>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_string().into(),
                    None => Value::Null
                };
            }
        },
        "_timestamp" => {
            let val: StdResult<Option<Vec<chrono::NaiveDateTime>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_string().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "time" => {
            let val: StdResult<Option<chrono::NaiveTime>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_string().into(),
                    None => Value::Null
                };
            }
        },
        "_time" => {
            let val: StdResult<Option<Vec<chrono::NaiveTime>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_string().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "interval" => {
            let val: StdResult<Option<types::Interval>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "_interval" => {
            let val: StdResult<Option<Vec<types::Interval>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "uuid" => {
            let val: StdResult<Option<uuid::Uuid>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => val.to_string().into(),
                    None => Value::Null
                };
            }
        },
        "_uuid" => {
            let val: StdResult<Option<Vec<uuid::Uuid>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => {
                        let values: Vec<Value> = val.iter().map(|current_value| current_value.to_string().into()).collect();
                        values.into()
                    },
                    None => Value::Null
                };
            }
        },
        "hstore" => {
            let val: StdResult<Option<HashMap<String, Option<String>>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        },
        "_hstore" => {
            let val: StdResult<Option<Vec<HashMap<String, Option<String>>>>, Error> = row.try_get(col_idx);

            if let Err(err) = val {
                with_error.replace(format!("{} : {}", get_row_error_msg, err));
            } else {
                *current_value.pointer_mut("/columnValue").unwrap() = match val.unwrap() {
                    Some(val) => serde_json::to_value(val).unwrap(),
                    None => Value::Null
                };
            }
        }
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