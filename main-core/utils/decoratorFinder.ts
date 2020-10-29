/**
 * This code has been created by Rudy Alula (https://github.com/SRNV)
 */

export type DecoratorReadResult = {
    decorator: string;
    isDefault: boolean;
    isAbstract: boolean;
    className: string;
    asClassName?: string;
    filePath?: string;
};

export function readDecoratorsExportedClass(input: string): Array<DecoratorReadResult> | null {

    let result = input;

    const removeAll = [
      [/(")(.*)(?<!\\)("){1}/i],
      [/(')(.*)(?<!\\)('){1}/i],
      [/(`)([\s\S]*)+(?<!\\)(`){1}/i],
      [/\(([^\(\)])*\)/, undefined, "()"],
      [/\[([^\[\]])*\]/],
      ["/*", "*/"],
      [/\/\/(.*)(\n){0,1}/],
    ];

    removeAll.forEach(([opening, closing]: any[]) => {
      const isPair = closing instanceof Boolean;
      const isRegExp = opening instanceof RegExp && closing === undefined;
      const isTemplateLitteral = opening === "${" && closing instanceof RegExp;
      const isSymetric = typeof opening === "string" && typeof closing === "string";
        switch (true) {

          case isRegExp:
            while (result.match(opening)) {
              result = result.replace(opening, "");
            }
          break;

          case isSymetric:
            const open = result.split(opening);
            open.forEach((part1) => {
              const content = part1.split(closing)[0];
              const all = `${opening}${content}${closing}`;
              result = result.replace(all, `${opening}${closing}`);
            });
          break;
        }
    });

    const regExp = /(?:\@(?<decorator>[\w]+?))\s*(?:export\s+)(default\s+){0,1}(abstract\s+){0,1}(?:class\s+){0,1}(?<function>[\w]+?)\s+{/g;
    const match = result.matchAll(regExp);

    if (match) {
      const matches = Array.from(match);
      const results: Array<DecoratorReadResult> = new Array<DecoratorReadResult>();
      matches.forEach((currentMatch) => {
        const [, decorator, isDefault, isAbstract, className] = currentMatch;
        results.push({
          decorator,
          isDefault: !!isDefault,
          isAbstract: !!isAbstract,
          className,
        });
      });
      return results;
    }
    
    return null;
  }