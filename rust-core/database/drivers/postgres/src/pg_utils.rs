use crate::*;
use rust_decimal::prelude::ToPrimitive;
use serde_json::*;
use std::result::{Result as StdResult};
use tokio_postgres::Error;
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct ColumnData {
    name: String,
    value: Value,
    #[serde(rename = "type")]
    ctype: String
}

impl ColumnData {
    pub fn new(name: String, value: Value, ctype: String) -> ColumnData {
        ColumnData {
            name,
            value,
            ctype
        }
    }
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

fn get_error_message() -> String {
    "An error has occurred while trying to get column".to_string()
}

fn process_column_value_non_complex<'a, T>(column_name: String, column_type: String, value: StdResult<Option<T>, Error>) -> StdResult<Value, String> where T: tokio_postgres::types::FromSql<'a> + Into<Value> {

    if let Err(err) = value {
        Err(format!("{} : {}", get_error_message(), err))
    } else {
        Ok(json!(ColumnData::new(column_name, match value.unwrap() {
            Some(val) => val.into(),
            None => Value::Null
        }, column_type)))
    }
}

fn process_column_complex<'a, T, F: Fn(T) -> Value>(column_name: String, column_type: String, value: StdResult<Option<T>, Error>, f: F) -> StdResult<Value, String> where T: tokio_postgres::types::FromSql<'a> {
    if let Err(err) = value {
        Err(format!("{} : {}", get_error_message(), err))
    } else {
        Ok(json!(ColumnData::new(column_name, match value.unwrap() {
            Some(val) => f(val),
            None => Value::Null
        }, column_type)))
    }
}


fn process_complex_column_vector<'a, T, F: Fn(&T) -> Value>(column_name: String, column_type: String, value: StdResult<Option<Vec<T>>, Error>, f: F) -> StdResult<Value, String> where T: tokio_postgres::types::FromSql<'a> {
    if let Err(err) = value {
        Err(format!("{} : {}", get_error_message(), err))
    } else {
        Ok(json!(ColumnData::new(column_name, match value.unwrap() {
            Some(val) => {
                let values: Vec<Value> = val.iter().map(f).collect();
                values.into()
            },
            None => Value::Null
        }, column_type)))
    }
}


pub fn get_column_value(row: &tokio_postgres::Row, column: &tokio_postgres::Column, col_idx: usize) -> StdResult<Value, String>  {
    let column_name = column.name().to_owned();
    let column_type = column.type_().to_string();

    let mut result: StdResult<Value, String> = Ok(json!(""));

    match column_type.as_ref() {
        "smallint" | "int2" | "smallserial" | "serial2" => {
            let val: StdResult<Option<i16>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_smallint" | "_int2" | "_smallserial" | "_serial2" => {
            let val: StdResult<Option<Vec<i16>>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "int4" | "int" | "integer" | "serial" | "serial4" => {
            let val: StdResult<Option<i32>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_int4" | "_int" | "_integer" | "_serial" | "_serial4" => {
            let val: StdResult<Option<Vec<i32>>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "bigint" | "int8" | "bigserial" | "serial8" => {
            let val: StdResult<Option<i64>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_bigint" | "_int8" | "_bigserial" | "_serial8" => {
            let val: StdResult<Option<Vec<i64>>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "real" | "float4" => {
            let val: StdResult<Option<f32>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_real" | "_float4" => {
            let val: StdResult<Option<Vec<f32>>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "float8" => {
            let val: StdResult<Option<f64>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_float8" => {
            let val: StdResult<Option<Vec<f64>>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "numeric" => {
            let val: StdResult<Option<rust_decimal::Decimal>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.to_f64().unwrap().into());
        },
        "_numeric" => {
            let val: StdResult<Option<Vec<rust_decimal::Decimal>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.to_f64().unwrap().into());
        }
        "varchar" | "character varying" | "text" | "citext" | "name" | "unknown" | "bpchar" => {
            let val: StdResult<Option<String>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_varchar" | "_character varying" | "_text" | "_citext" | "_name" | "_unknown" | "_bpchar" => {
            let val: StdResult<Option<Vec<String>>, Error> = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "bytea" => {
            let val: StdResult<Option<Vec<u8>>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_bytea" => {
            let val: StdResult<Option<Vec<Vec<u8>>>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "bool" | "boolean" => {
            let val: StdResult<Option<bool>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "_bool" | "_boolean" => {
            let val: StdResult<Option<Vec<bool>>, Error>  = row.try_get(col_idx);
            result = process_column_value_non_complex(column_name, column_type, val);
        },
        "money" => {
            let val: StdResult<Option<types::Money>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.value().into());
        },
        "_money" => {
            let val: StdResult<Option<Vec<types::Money>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.value().into());
        },
        "bit" | "varbit" => {
            let val: StdResult<Option<BitVec>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.to_bytes().into());
        },
        "_bit" | "_varbit" => {
            let val: StdResult<Option<Vec<BitVec>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.to_bytes().into());
        },
        "box" => {
            let val: StdResult<Option<geo_types::Rect<f64>>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| process_rect(current_value).into());
        },
        "_box" => {
            let val: StdResult<Option<Vec<geo_types::Rect<f64>>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| process_rect(*current_value).into());
        },
        "cidr" => {
            let val: StdResult<Option<types::Cidr>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| {
                match current_value.ip() {
                    Some(ipd) => {
                        match ipd {
                            ipnetwork::IpNetwork::V4(ip) => (ip.to_string()).into(),
                            ipnetwork::IpNetwork::V6(ip) => (ip.to_string()).into()
                        }
                    },
                    None => Value::Null
                }
            });
        },
        "_cidr" => {
            let val: StdResult<Option<Vec<types::Cidr>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| match current_value.ip() {
                Some(ipd) => {
                    match ipd {
                        ipnetwork::IpNetwork::V4(ip) => (ip.to_string()).into(),
                        ipnetwork::IpNetwork::V6(ip) => (ip.to_string()).into()
                    }
                },
                None => Value::Null
            });
        },
        "circle" => {
            let val: StdResult<Option<types::Circle>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| serde_json::to_value(current_value).unwrap());
        },
        "_circle" => {
            let val: StdResult<Option<Vec<types::Circle>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| serde_json::to_value(current_value).unwrap());
        },
        "date" => {
            let val: StdResult<Option<time::Date>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| {
                let date_format = format!("{}-{}-{}", current_value.year(), current_value.month(), current_value.day());
                date_format.into()
            });
        },
        "_date" => {
            let val: StdResult<Option<Vec<time::Date>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| {
                let date_format = format!("{}-{}-{}", current_value.year(), current_value.month(), current_value.day());
                date_format.into()
            });
        },
        "inet" => {
            let val: StdResult<Option<std::net::IpAddr>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.to_string().into());
        },
        "_inet" => {
            let val: StdResult<Option<Vec<std::net::IpAddr>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.to_string().into());
        },
        "json" | "jsonb" => {
            let val: StdResult<Option<serde_json::Value>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value);
        },
        "_json" | "_jsonb" => {
            let val: StdResult<Option<Vec<serde_json::Value>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.clone().into());
        },
        "line" | "lseg" => {
            let val: StdResult<Option<types::Line>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| serde_json::to_value(current_value).unwrap());
        },
        "_line" | "_lseg" => {
            let val: StdResult<Option<Vec<types::Line>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| serde_json::to_value(current_value).unwrap());
        },
        "macaddr" => {
            let val: StdResult<Option<eui48::MacAddress>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.to_canonical().into());
        },
        "_macaddr" => {
            let val: StdResult<Option<Vec<eui48::MacAddress>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.to_canonical().into());
        },
        "path"  => {
            let val: StdResult<Option<geo_types::LineString<f64>>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.into_points().iter().map(|point| serde_json::to_value(types::Point::new(point.x(), point.y())).unwrap()).collect());
        },
        "pg_lsn"  => {
            let val: StdResult<Option<types::PgLsn>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |current_value| current_value.value().into());
        },
        "_pg_lsn"  => {
            let val: StdResult<Option<Vec<types::PgLsn>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |current_value| current_value.value().into());
        },
        "point" => {
            let val: StdResult<Option<geo_types::Point<f64>>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| (types::Point::new(val.x(), val.y())).json());
        },
        "_point" => {
            let val: StdResult<Option<Vec<geo_types::Point<f64>>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| (types::Point::new(val.x(), val.y())).json());
        },
        "timestamptz" => {
            let val: StdResult<Option<chrono::DateTime<chrono::Utc>>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| val.to_string().into());
        },
        "_timestamptz" => {
            let val: StdResult<Option<Vec<chrono::DateTime<chrono::Utc>>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| val.to_string().into());
        },
        "timestamp" => {
            let val: StdResult<Option<chrono::NaiveDateTime>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| val.to_string().into());
        },
        "_timestamp" => {
            let val: StdResult<Option<Vec<chrono::NaiveDateTime>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| val.to_string().into());
        },
        "time" => {
            let val: StdResult<Option<chrono::NaiveTime>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| val.to_string().into());
        },
        "_time" => {
            let val: StdResult<Option<Vec<chrono::NaiveTime>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| val.to_string().into());
        },
        "interval" => {
            let val: StdResult<Option<types::Interval>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| serde_json::to_value(val).unwrap());
        },
        "_interval" => {
            let val: StdResult<Option<Vec<types::Interval>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| serde_json::to_value(val).unwrap());
        },
        "uuid" => {
            let val: StdResult<Option<uuid::Uuid>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| val.to_string().into());
        },
        "_uuid" => {
            let val: StdResult<Option<Vec<uuid::Uuid>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| val.to_string().into());
        },
        "hstore" => {
            let val: StdResult<Option<HashMap<String, Option<String>>>, Error> = row.try_get(col_idx);
            result = process_column_complex(column_name, column_type, val, |val| serde_json::to_value(val).unwrap());
        },
        "_hstore" => {
            let val: StdResult<Option<Vec<HashMap<String, Option<String>>>>, Error> = row.try_get(col_idx);
            result = process_complex_column_vector(column_name, column_type, val, |val| serde_json::to_value(val).unwrap());
        }
        _ => {
            result = Ok(Value::Null);
        }
        
    }

    result
}