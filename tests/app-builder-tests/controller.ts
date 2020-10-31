import { Controller, GET, Service} from "https://deno.land/x/mandarinets@v2.2.0/mod.ts";

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