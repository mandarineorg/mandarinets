use crate::*;
use std::fmt::*;


#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn execute_query(command: Command) -> util::AsyncJsonOp<i32> {
   
    let fut = async move {
        let pool = POOL_INSTANCE.get().unwrap();

        let ias = (STATIC_TOKIO).spawn(async move {
            let client = pool.get().await;
            let mut value: i32 = 0;
            match client {
                Ok(client)=> {
                    let prepared_statement = client.prepare("SELECT 1 + $1").await;
                    match prepared_statement {
                        Ok(statement) => {
                            let int: i32 = 15;
                            let rows = client.query(&statement, &[&int]).await;
                            match rows {
                                Ok(rows) => {
                                    value = rows[0].get(0);
                                },
                                Err(e) => {

                                }
                            }
                        },
                        Err(e) => {

                        }
                    }
                },
                Err(e)=> {
                   println!("file not found \n{:?}",e);   //handled error
                }
             }
            
            value
            
        }).await.unwrap();

        Ok(ias)
    };

    fut.boxed()
}