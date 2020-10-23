use crate::*;
use serde_json::Value;
use tokio_postgres::types::*;
use std::collections::*;
use pg_utils::*;
use pg_interfaces::{QueryResult, CommonStatementArgs};
use std::convert::TryFrom;

pub fn execute_query(command: Command) -> util::AsyncJsonOp<QueryResult> {
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

                    let rows = unwrapped_pool.execute(&(prepared_statement.unwrap()), &processed_params).await;

                    if let Err(e) = rows {
                        Err(e.to_string())
                    } else {
                        let rows_affected: u64 = rows.unwrap();
                        let rows_affected = usize::try_from(rows_affected);
                        let mut final_rows_affected: Option<usize> = None;
                        
                        if let Err(e) = rows_affected {
                            final_rows_affected.replace(usize::MIN);
                        } else {
                            final_rows_affected.replace(rows_affected.unwrap());
                        }

                        Ok(QueryResult::new(args.statement, pg_utils::get_empty_rows_list(), final_rows_affected.unwrap(), true))
                    }
                }
            }
            
        }).await.unwrap();

        ias
    };

    fut.boxed()

}