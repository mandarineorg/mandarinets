use crate::*;
use serde_json::Value;
#[derive(Serialize, Deserialize, Debug)]
pub struct Point {
    x: f64,
    y: f64
}

impl Point {
    pub fn new(x: f64, y: f64) -> Point {
        Point {
            x: x,
            y: y
        }
    }

    pub fn x(&self) -> f64 {
        self.x
    }

    pub fn y(&self) -> f64 {
        self.y
    }

    pub fn json(&self) -> Value {
        serde_json::to_value(self).unwrap()
    }
}