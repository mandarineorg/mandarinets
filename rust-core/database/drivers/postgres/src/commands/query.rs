use crate::*;
use std::fmt::*;
use std::rc::Rc;
use std::result::{Result as StdResult};
use tokio::runtime::Builder;

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectResult {
    success: bool
}

pub fn calculate(command: Command) -> util::AsyncJsonOp<i32> {
   
    let fut = async {
        let rt = Builder::new_multi_thread().build().unwrap();

        let result = rt.spawn(async {
            println!("invoking");
            // let pool = PG_POOL.lock().unwrap().take().unwrap();
            // let client = pool.get().await.unwrap();
            // let stmt = client.prepare("SELECT 1 + $1").await.unwrap();
            // let int: i32 = 15;
            // let rows = client.query(&stmt, &[&int]).await.unwrap();
            // let value: i32 = rows[0].get(0);
            
            // value

            let val: i32 = 25;
            val
        }).await.unwrap();
        
        Ok(result)
    };
    fut.boxed()
}