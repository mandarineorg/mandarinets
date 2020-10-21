use crate::*;

use byteorder::{BigEndian, ReadBytesExt};
use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;

#[derive(Debug)]
pub struct Money {
    value: f64,
    buf: Vec<u8>,
}

fn transformation(value: i64) -> f64 {
    let float_v: f64 = ((value as f64 / 1000 as f64) * 10 as f64) as f64;
    float_v
}

impl Money {
    pub fn new(value: f64, buf: &[u8]) -> Money {
        let u8vec = buf.to_vec();
        Money {
            value: value,
            buf: u8vec
        }
    }

    pub fn value(&self) -> f64 {
        self.value
    }
}

impl tokio_postgres::types::ToSql for Money {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        //w.put_i64(self.value);
        Ok(IsNull::No)
    }

    accepts!(MONEY);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for Money {
    fn from_sql(ty: &Type, mut buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {
        let v = buf.read_i64::<BigEndian>()?;

        if !buf.is_empty() {
            return Err("invalid buffer size".into());
        }

        let float_v: f64 = transformation(v);
        Ok(Money::new(float_v, buf))
    }

    tokio_postgres::types::accepts!(MONEY);
}