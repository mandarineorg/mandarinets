# Promise Repeater
The promise repeater plugin allows you to "try" and repeat promises until they are resolved. It also allows you establish a margin of milliseconds between each try.

----

## Methods

| Method | Description |
| ------ | ----------- |
| maxAttempts | Sets limit of attempts for retrying promise
| unlimitedAttempts | Sets a infinite limit of attempts
| delay | Sets a delay (in milliseconds) for each retry
| start / attempt | Starts the process of resolving the promise and retrying until it is resolved


## API

```typescript
import { PromiseRepeater } from "https://deno.land/x/mandarinets@v2.1.2/mod.ts";

let i: number = 0;
const promiseFunction: Function = async () => {
    i++;
    console.log(`Attempt ${i}`);
    if(i < 3) throw new Error();
    console.log("Resolved");
    return true;
}

const val1: any = await new PromiseRepeater(promiseFunction).maxAttempts(4).start();
i = 0;
const val2: any = await new PromiseRepeater(promiseFunction).maxAttempts(4).delay(2000).start();
i = 0;
const val3: any =  await new PromiseRepeater(promiseFunction).unlimitedAttempts().delay(1000).start();
i = 0;
const val4: any = await new PromiseRepeater(promiseFunction).maxAttempts(1).start();

console.log(val1);
console.log(val2);
console.log(val3);
console.log(val4);

```

Result:

```text

Attempt 1
Attempt 2
Attempt 3
Resolved

Attempt 1 // Second #2
Attempt 2 // Second #4
Attempt 3 // Second #6
Resolved

Attempt 1
Attempt 2
Attempt 3
Resolved

Attempt 1 
// Throw the error on method `promiseFunction` since it ran out of attemps and it was never resolved.
error: Uncaught Error: 
    if(i < 3) throw new Error();
```
