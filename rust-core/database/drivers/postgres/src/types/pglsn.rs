use crate::*;

use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;

use byteorder::{BigEndian, ReadBytesExt};
use super::types_utils::{Point};

#[derive(Serialize, Deserialize, Debug)]
pub struct PgLsn {
    value: String
}


impl PgLsn {
    pub fn new(value: String) -> PgLsn {
        PgLsn {
            value
        }
    }
    pub fn value(&self) -> String {
        self.value.to_owned()
    }
}

impl tokio_postgres::types::ToSql for PgLsn {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        Ok(IsNull::No)
    }

    accepts!(PG_LSN);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for PgLsn {
    fn from_sql(_: &Type, buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {
       Ok(PgLsn::new(hex::encode(buf)))
    }

    tokio_postgres::types::accepts!(PG_LSN);
}