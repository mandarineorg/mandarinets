use crate::*;
use std::fmt::*;
use serde_json::Value;
use tokio_postgres::types::*;
use std::collections::*;
use pg_utils::*;
use std::result::{Result as StdResult};
use pg_interfaces::{QueryResult, CommonStatementArgs};

pub fn prepared_statement_query(command: Command) -> util::AsyncJsonOp<QueryResult> {
    let args: CommonStatementArgs = serde_json::from_slice(command.data[0].as_ref()).map_err(|e| e.to_string()).unwrap();
    let fut = async move {
        let pool = POOL_INSTANCE.get().unwrap();
        let ias = (STATIC_TOKIO).spawn(async move {
            let client = pool.get().await;
            let parameters = args.parameters.unwrap().clone();

            if let Err(e) = client {
                Err(e.to_string())
            } else {
                let unwrapped_pool = client.unwrap();

                let prepared_statement = unwrapped_pool.prepare_typed(&args.statement, &get_parameter_types(parameters.clone())).await;
                
                if let Err(e) = prepared_statement {
                    Err(e.to_string())
                } else {

                    let mut bool_values: HashMap<usize, bool> = HashMap::new();
                    let mut number_values_i64: HashMap<usize, i64> = HashMap::new();
                    let mut number_values_f32: HashMap<usize, f32> = HashMap::new();
                    let mut string_values: HashMap<usize, String> = HashMap::new();
                    let mut null_values: HashMap<usize, Option<String>> = HashMap::new();
                    let mut processed_params: Vec<&PGParameters> = Vec::new();
                    let mut map_index: usize = 0;

                    parameters.iter().for_each(|p| {
                        match p {
                            Value::Bool(boolval) =>  {
                                bool_values.insert(map_index, boolval.clone());
                                map_index += 1;
                            },
                            Value::Number(num) => {
                                if num.is_i64() {
                                    number_values_i64.insert(map_index, num.as_i64().unwrap());
                                } else if num.is_f64() {
                                    number_values_f32.insert(map_index, num.as_f64().unwrap() as f32);
                                }
                                map_index += 1;
                            },
                            Value::String(strval) => {
                                string_values.insert(map_index, strval.clone());
                                map_index += 1;
                            },
                            _ => {
                                null_values.insert(map_index, None);
                                map_index += 1;
                            }
                        }
                    });

                    for (pos, e) in parameters.iter().enumerate() {
                        let mut processed_value: Option<&PGParameters> = None;
                        match e {
                            Value::Bool(_) =>  {
                                let currentval = bool_values.get(&pos).unwrap();
                                processed_value.replace(currentval as &PGParameters);
                            },
                            Value::Number(num) => {
                                if num.is_i64() {
                                    let currentval = number_values_i64.get(&pos).unwrap();
                                    processed_value.replace(currentval as &PGParameters);
                                } else if num.is_f64() {
                                    let currentval = number_values_f32.get(&pos).unwrap();
                                    processed_value.replace(currentval as &PGParameters);
                                }
                                
                            },
                            Value::String(_) => {
                                let currentval = string_values.get(&pos).unwrap();
                                processed_value.replace(currentval as &PGParameters);
                            },
                            _ => {
                                let currentval = null_values.get(&pos).unwrap();
                                processed_value.replace(currentval as &PGParameters);
                            }
                        }
                        processed_params.push(processed_value.unwrap());
                    }

                    let rows = unwrapped_pool.query(&(prepared_statement.unwrap()), &processed_params).await;

                    if let Err(e) = rows {
                        Err(e.to_string())
                    } else {
                        let rows: Vec<tokio_postgres::Row> = rows.unwrap();
                        
                        let mandarine_rows: StdResult<Vec<Vec<serde_json::Value>>, String> = (&rows).iter().map(|row| {
                        let cols = row.columns().iter();
                        let mut return_columns: Vec<serde_json::Value> = vec![];
                                
                        for (colnumber, column) in cols.enumerate() {
                            let colval = pg_utils::get_column_value(row, column, colnumber);
                            if let Err(e) = colval {
                                return Err(e.to_string());
                            } else {
                                return_columns.push(colval.unwrap());
                            }
                        }

                        Ok(return_columns)
                        }).collect();
                            
                        match mandarine_rows {
                            Ok(val) => {
                                let count = (&val).len();
                                let query_result: QueryResult = QueryResult::new(args.statement, val, count, true);
                                Ok(query_result)
                            },
                            Err(err) => Err(err)
                        }
                    }
                }
            }
            
        }).await.unwrap();

       ias
    };

    fut.boxed()
}