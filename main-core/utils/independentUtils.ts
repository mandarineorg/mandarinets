// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class IndependentUtils {
    public static isVersionValidSemantic(v: string = ""): boolean {
        let match = /(\d+)\.(\d+).(\d+)/.exec(v);
        if (match) {
          let major = parseInt(match[1], 10);
          if (major >= 3) {
            return true;
          }
        }
        return false;
    }

    public static moveToFront<T = any>(array: Array<T>, property: any, expectedValue: any): Array<T> {
      const newArray = [...array];
      newArray.forEach((item: T, i) => {
        // @ts-ignore
        if(item[property] === expectedValue) {
          newArray.splice(i, 1);
          newArray.unshift(item);
        }
      });
      return newArray;
    }

    public static isObject(o: any): boolean {
      return o instanceof Object && o.constructor === Object;
    }
}