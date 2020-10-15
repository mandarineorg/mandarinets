use crate::*;
use std::fmt::*;
use std::panic;
use tokio::runtime::Runtime;
use std::result::{Result as StdResult};

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn calculate(command: Command) -> util::AsyncJsonOp<i32> {
    
    let fut = async move {
        // let mut rt = Runtime::new().unwrap();
        // let mut result: i32 = 0;

        // result = rt.block_on(async {
            let pool = PG_POOL.lock().unwrap().take().unwrap();
            let client = pool.get().await.unwrap();
            let stmt = client.prepare("SELECT 1 + $1").await.unwrap();
            let int: i32 = 15;
            let rows = client.query(&stmt, &[&int]).await.unwrap();
            let value: i32 = rows[0].get(0);
            
            //return value;
        // });

        Ok(value)
    };
    fut.boxed()
}