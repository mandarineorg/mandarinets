// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.
// This file should not contain any imports

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

    public static isNumeric(num: any) {
      return !isNaN(num);
    }

    public static parseToKnownType(value: any) {
      if(value === "true" || value === true) return true;
      if(value === "false" || value === false) return false;
      if(IndependentUtils.isNumeric(value)) return parseFloat(value);
      return value;
    }

    public static readConfigByDots(configObject: any, configKey: string) {
      try {
        if(configKey.includes('.')) {
            let parts = configKey.split('.');

            if (Array.isArray(parts)) {
                let last: any = parts.pop();
                let keyPropertiesLength = parts.length;
                let propertiesStartingIndex = 1;

                let currentProperty = parts[0];
        
                while((configObject = configObject[currentProperty]) && propertiesStartingIndex < keyPropertiesLength) {
                    currentProperty = parts[propertiesStartingIndex];
                    propertiesStartingIndex++;
                }
                
                return IndependentUtils.parseToKnownType(configObject[last]);
            } else {
                return undefined;
            }
        } else {
            return IndependentUtils.parseToKnownType(configObject[configKey]);
        }
    } catch(error) {
        return undefined;
    }
  }

    public static getPrototypeMethods(object: any): Array<string> {
      return Object.getOwnPropertyNames(object.prototype).filter((item) => item !== "constructor");
    }

    public static setDefaultValues(object: any, defaultObject: any): any {
      const ownObject = {...object};
      const keys = Object.keys(defaultObject);

      keys.forEach((key) => {
          const defaultValue = defaultObject[key];

          if(ownObject[key] === undefined) {
              ownObject[key] = defaultValue;
          } else {
              if(typeof defaultValue === "object") {
                  ownObject[key] = this.setDefaultValues(ownObject[key], defaultValue);
              } else {
                  ownObject[key] = ownObject[key] === undefined ? defaultValue : ownObject[key];
              }
          }
      });

      return ownObject;
    }

    public static camelToUnderscore(key: string): string {
      const result = key.replace( /([A-Z])/g, " $1" );
      return result.split(' ').join('_').toLowerCase();
    }

    public static toCamel(s: string): string {
      return s.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });
    }

}