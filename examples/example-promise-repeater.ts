import { PromiseRepeater } from "https://deno.land/x/mandarinets/pluggins/promiseRepeater.ts";

let i = 0;
const promiseFunction = async () => {
    i++;
    console.log(`Attempt ${i}`);
    if(i < 3) throw new Error();
    console.log("Resolved");
    return true;
}

const val1 = await new PromiseRepeater(promiseFunction).maxAttempts(4).start();
i = 0;
const val2 = await new PromiseRepeater(promiseFunction).maxAttempts(4).delay(2000).start();
i = 0;
const val3 =  await new PromiseRepeater(promiseFunction).unlimitedAttempts().delay(1000).start();
i = 0;
const val4 = await new PromiseRepeater(promiseFunction).maxAttempts(1).start();

console.log(val1);
console.log(val2);
console.log(val3);
console.log(val4);