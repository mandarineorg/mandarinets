import { assert } from "https://deno.land/std@0.51.0/testing/asserts.ts";
import { HmacSha256 } from "../hash/sha256.ts";

// Part of this class is a fraction of https://github.com/oakserver/oak/blob/master/tssCompare.ts

export class SecurityUtils {
    public static compareArrayBuffer(a: ArrayBuffer, b: ArrayBuffer): boolean {
        assert(a.byteLength === b.byteLength, "ArrayBuffer lengths must match.");
        const va = new DataView(a);
        const vb = new DataView(b);
        const length = va.byteLength;
        let out = 0;
        let i = -1;
        while (++i < length) {
          out |= va.getUint8(i) ^ vb.getUint8(i);
        }
        return out === 0;
      }
      
      /** Compare two strings, Uint8Arrays, ArrayBuffers, or arrays of numbers in a
       * way that avoids timing based attacks on the comparisons on the values.
       * 
       * The function will return `true` if the values match, or `false`, if they
       * do not match. */
      public static compare(a: string | number[] | ArrayBuffer | Uint8Array, b: string | number[] | ArrayBuffer | Uint8Array): boolean {
        const key = new Uint8Array(32);
        window.crypto.getRandomValues(key);
        const ah = (new HmacSha256(key)).update(a).arrayBuffer();
        const bh = (new HmacSha256(key)).update(b).arrayBuffer();
        return this.compareArrayBuffer(ah, bh);
      }
      
}