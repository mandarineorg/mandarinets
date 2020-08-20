// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

const base64_code =
  "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(
    "",
  );

const index_64 = new Uint8Array([
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  1,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  62,
  63,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  -1,
  -1,
  -1,
  -1,
  -1,
]);

export function encode(d: Uint8Array, len: number): string {
  let off = 0;
  let rs: string[] = [];
  let c1 = 0;
  let c2 = 0;

  while (off < len) {
    c1 = d[off++] & 0xff;
    rs.push(base64_code[(c1 >> 2) & 0x3f]);
    c1 = (c1 & 0x03) << 4;
    if (off >= len) {
      rs.push(base64_code[c1 & 0x3f]);
      break;
    }
    c2 = d[off++] & 0xff;
    c1 |= (c2 >> 4) & 0x0f;
    rs.push(base64_code[c1 & 0x3f]);
    c1 = (c2 & 0x0f) << 2;
    if (off >= len) {
      rs.push(base64_code[c1 & 0x3f]);
      break;
    }
    c2 = d[off++] & 0xff;
    c1 |= (c2 >> 6) & 0x03;
    rs.push(base64_code[c1 & 0x3f]);
    rs.push(base64_code[c2 & 0x3f]);
  }
  return rs.join("");
}

// x is a single character
function char64(x: string): number {
  if (x.length > 1) {
    throw new Error("Expected a single character");
  }

  let characterAsciiCode = x.charCodeAt(0);

  if (characterAsciiCode < 0 || characterAsciiCode > index_64.length) return -1;
  return index_64[characterAsciiCode];
}

export function decode(s: string, maxolen: number): Uint8Array {
  let rs: number[] = [];
  let off = 0;
  let slen = s.length;
  let olen = 0;
  let ret: Uint8Array;
  let c1, c2, c3, c4, o;

  if (maxolen <= 0) throw new Error("Invalid maxolen");

  while (off < slen - 1 && olen < maxolen) {
    c1 = char64(s.charAt(off++));
    c2 = char64(s.charAt(off++));
    if (c1 === -1 || c2 === -1) break;
    o = c1 << 2;
    o |= (c2 & 0x30) >> 4;
    rs.push(o);
    if (++olen >= maxolen || off >= slen) break;
    c3 = char64(s.charAt(off++));
    if (c3 === -1) break;
    o = (c2 & 0x0f) << 4;
    o |= (c3 & 0x3c) >> 2;
    rs.push(o);
    if (++olen >= maxolen || off >= slen) break;
    c4 = char64(s.charAt(off++));
    o = (c3 & 0x03) << 6;
    o |= c4;
    rs.push(o);
    ++olen;
  }

  ret = new Uint8Array(olen);
  for (off = 0; off < olen; off++) ret[off] = rs[off];
  return ret;
}