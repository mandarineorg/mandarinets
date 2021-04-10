// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.
import * as Microlemon from "./mod.ts";

export namespace Microservices {

    export import Transporters = Microlemon.Transporters;

    export namespace Clients {
        export const AmqpClient = Microlemon.AmqpClient;
        export const RedisClient = Microlemon.RedisClient;
        export const NatsClient = Microlemon.NatsClient;
    }


}