use crate::*;

use tokio_postgres::types::{Type, IsNull};
use std::result::{Result as StdResult};
use bytes::{BytesMut};
use std::error::Error;
use tokio_postgres::types::*;

use byteorder::{BigEndian, ReadBytesExt};

#[derive(Serialize, Deserialize, Debug)]
pub struct Interval {
    pub microseconds: i64,
    
    pub days: i32,
        
    pub months: i32,
}


impl Interval {
    pub fn new(microseconds: i64, days: i32, months: i32) -> Self {
        Interval {
            days,
            microseconds,
            months,
        }
    }

    /// Equivalent to `new(microseconds, 0, 0)`
    pub fn from_microseconds(microseconds: i64) -> Self {
        Self::new(microseconds, 0, 0)
    }

    /// Equivalent to `new(0, days, 0)`
    pub fn from_days(days: i32) -> Self {
        Self::new(0, days, 0)
    }

    /// Equivalent to `new(0, 0, months)`
    pub fn from_months(months: i32) -> Self {
        Self::new(0, 0, months)
    }    
}

impl tokio_postgres::types::ToSql for Interval {
    fn to_sql(&self, _: &Type, w: &mut BytesMut) -> StdResult<IsNull, Box<dyn Error + Sync + Send>> {
        Ok(IsNull::No)
    }

    accepts!(INTERVAL);
    tokio_postgres::types::to_sql_checked!();
}

impl<'a> tokio_postgres::types::FromSql<'a> for Interval {
    fn from_sql(_: &Type, buf: &[u8]) -> StdResult<Self, Box<dyn Error + Sync + Send>> {

        let mut microsecs_buf: &[u8] = &buf[0..8];
        let microsecs = microsecs_buf.read_i64::<BigEndian>()?;

        let mut days_buf: &[u8] = &buf[8..12];
        let days = days_buf.read_i32::<BigEndian>()?;

        let mut months_buf: &[u8] = &buf[12..16];
        let months = months_buf.read_i32::<BigEndian>()?;


        Ok(Interval::new(microsecs, days, months))

    }

    tokio_postgres::types::accepts!(INTERVAL);
}