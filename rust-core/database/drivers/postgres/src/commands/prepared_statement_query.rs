use crate::*;
use std::fmt::*;
use futures::TryStreamExt;
use serde_json::Value;
use std::any::Any;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PreparedStatementArgs {
    statement: String,
    parameters: Vec<Value>
}

pub fn prepared_statement_query(command: Command) -> util::AsyncJsonOp<Vec<Vec<Value>>> {
    let args: PreparedStatementArgs = serde_json::from_slice(command.data[0].as_ref()).map_err(|e| e.to_string()).unwrap();
    let fut = async move {
        let pool = POOL_INSTANCE.get().unwrap();

        let ias = (STATIC_TOKIO).spawn(async move {
            let client = pool.get().await;

            if let Err(e) = client {
                Err(e.to_string())
            } else {
                let unwrapped_pool = client.unwrap();
                let prepared_statement = unwrapped_pool.prepare(&args.statement).await;
                
                if let Err(e) = prepared_statement {
                    Err(e.to_string())
                } else {
                    let parameters = args.parameters;
                    let parametersmap = parameters.iter().map(|p| (&p[0]) as &(dyn tokio_postgres::types::ToSql + Sync));
                    let parametersmap = parametersmap.collect::<Vec<_>>();
                    let params = parametersmap.as_slice();
                    let rows = unwrapped_pool.query(&(prepared_statement.unwrap()), params).await;

                    if let Err(e) = rows {
                        Err(e.to_string())
                    } else {
                        let rows: Vec<tokio_postgres::Row> = rows.unwrap();
                        
                        let mandarine_rows: Vec<Vec<serde_json::Value>> = (&rows).iter().map(|row| {
                        let cols = row.columns().iter();
                        let mut return_columns: Vec<serde_json::Value> = vec![];
                                
                        for (colnumber, column) in cols.enumerate() {
                            return_columns.push(pg_utils::get_column_value(row, column, colnumber));
                        }

                        return_columns
                        }).collect();
                            
                        Ok(mandarine_rows)
                    }
                }
            }
            
        }).await.unwrap();

       ias
    };

    fut.boxed()
}