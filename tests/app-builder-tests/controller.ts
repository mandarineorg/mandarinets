// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { Controller, GET, Service} from "https://deno.land/x/mandarinets@v2.3.1/mod.ts";

@Controller()
export class MyController {
    @GET('/hello')
    public hello() {
        return "Hi";
    }
}

@Service()
export class MyService {
    
}