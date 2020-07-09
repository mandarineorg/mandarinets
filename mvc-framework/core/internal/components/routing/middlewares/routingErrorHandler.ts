// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export default async ({ response }, nextFn) => {
    try {
      await nextFn();
    } catch (err) {
      response.status = 500;
      response.body = { msg: err.message };
    }
};