# Logger as Injectable
With Mandarine exposing its internal logger as an injectable, you may write content on the console keeping the format Mandarine has.

---------

## Usage

```typescript
import { Log } from "https://deno.land/x/mandarinets@v2.3.2/mod.ts"; 

@Service()
export class MyService {
    constructor(logger: Log) {}
}
```