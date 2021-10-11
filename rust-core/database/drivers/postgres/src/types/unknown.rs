use crate::*;
use tokio_postgres::types::{Type};
use std::result::{Result as StdResult};
use std::error::Error;

#[derive(Serialize, Deserialize, Debug)]
pub struct Unknown {
    value: Vec<u8>
}

impl Unknown {
    pub fn new(vecu8: Vec<u8>) -> Unknown {
        Unknown {
            value: vecu8
        }
    }

    pub fn value(&self) -> Vec<u8> {
        self.value.clone()
    }
}
impl<'a> tokio_postgres::types::FromSql<'a> for Unknown {
    fn from_sql(_: &Type, buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {
       Ok(Unknown::new(buf.to_vec()))
    }

    fn accepts(_: &Type) -> bool {
        true
    }
}