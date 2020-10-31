// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { MandarineEnvironmentalConstants } from "./MandarineEnvConstants.ts";
import { expandGlobSync } from "https://deno.land/std@0.71.0/fs/mod.ts";
import {
  readDecoratorsExportedClass,
  DecoratorReadResult,
} from "./utils/decoratorFinder.ts";
import { MandarineConstants } from "./mandarineConstants.ts";

const getCore = async () => {
  return (await import("./mandarineCore.ts")).MandarineCore;
};

export class AppBuilder {
  private readonly ENVIRONMENTAL_VARIABLES = [
    MandarineEnvironmentalConstants.MANDARINE_SERVER_HOST,
    MandarineEnvironmentalConstants.MANDARINE_SERVER_PORT,
    MandarineEnvironmentalConstants.MANDARINE_SERVER_RESPONSE_TIME_HEADER,
    MandarineEnvironmentalConstants.MANDARINE_SERVER_SESSION_MIDDLEWARE,
    MandarineEnvironmentalConstants.MANDARINE_STATIC_CONTENT_FOLDER,
    MandarineEnvironmentalConstants.MANDARINE_AUTH_EXPIRATION_MS,
  ];

  public setHost(host: string): AppBuilder {
    Deno.env.set(MandarineEnvironmentalConstants.MANDARINE_SERVER_HOST, host);
    return this;
  }

  public setPort(port: number): AppBuilder {
    Deno.env.set(
      MandarineEnvironmentalConstants.MANDARINE_SERVER_PORT,
      port.toString()
    );
    return this;
  }

  public enableResponseTimeHeader(value: boolean = true): AppBuilder {
    Deno.env.set(
      MandarineEnvironmentalConstants.MANDARINE_SERVER_RESPONSE_TIME_HEADER,
      value.toString()
    );
    return this;
  }

  public enableSessions(value: boolean = true): AppBuilder {
    Deno.env.set(
      MandarineEnvironmentalConstants.MANDARINE_SERVER_SESSION_MIDDLEWARE,
      value.toString()
    );
    return this;
  }

  public setStaticContentFolder(folderPath: string): AppBuilder {
    Deno.env.set(
      MandarineEnvironmentalConstants.MANDARINE_STATIC_CONTENT_FOLDER,
      folderPath
    );
    return this;
  }

  public setAuthExpirationTime(expirationTimeMs: number): AppBuilder {
    Deno.env.set(
      MandarineEnvironmentalConstants.MANDARINE_AUTH_EXPIRATION_MS,
      expirationTimeMs.toString()
    );
    return this;
  }

  public async buildCore(components: Array<{ new (): any }>) {
    // This function does nothing. We only need to import the references and Mandarine will do its magic.
    return new (await getCore())();
  }

  public async buildMVC(components: Array<{ new (): any }>) {
    // This function does nothing. We only need to import the references and Mandarine will do its magic.
    return (await this.buildCore(components)).MVC();
  }

  public automaticBuildAndRun(config: {
    tsconfigPath: string;
    flags: Array<string>;
    reload?: boolean;
  }) {
    const entries: Map<string, Array<DecoratorReadResult>> = new Map<
      string,
      Array<DecoratorReadResult>
    >();
    const decoder: TextDecoder = new TextDecoder();

    for (const file of expandGlobSync("./**/*.ts")) {
      const path = file.path;
      const decorators = readDecoratorsExportedClass(
        decoder.decode(Deno.readFileSync(path))
      );
      if (decorators !== null) {
        const insertionDecorators = decorators.map((decorator) => {
          decorator.filePath = path;
          return decorator;
        });
        entries.set(path, insertionDecorators);
      }
    }

    let decoratorsArray: Array<DecoratorReadResult> = new Array<
      DecoratorReadResult
    >();
    Array.from(entries.values()).forEach(
      (decoratorResults: Array<DecoratorReadResult>) => {
        decoratorsArray = decoratorsArray.concat(decoratorResults);
      }
    );

    let dynamicEntryFile = `import { MandarineCore } from "https://deno.land/x/mandarinets@${MandarineConstants.RELEASE_VERSION}/mod.ts";`;

    const classNameRepetitions = (className: string) =>
      decoratorsArray.filter((decorator) => decorator.className === className)
        .length;
    const isClassNameRepeated = (className: string): boolean =>
      classNameRepetitions(className) >= 2;

    const repetitionStats: {
      [prop: string]: { current: number; maxRepetitions: number };
    } = {};

    decoratorsArray.forEach((value: DecoratorReadResult, index: number) => {
      const { className } = value;
      let asClassName;
      if (isClassNameRepeated(className)) {
        if (!repetitionStats[className]) {
          repetitionStats[className] = {
            current: 0,
            maxRepetitions: classNameRepetitions(className),
          };
        } else {
          repetitionStats[className].current += 1;
          asClassName = `${className}${repetitionStats[className].current}`;
        }
        value.asClassName = asClassName;
      }

      decoratorsArray[index] = value;
    });

    decoratorsArray.forEach((value: DecoratorReadResult) => {
      let currentClassName = value.asClassName
        ? `${value.className} as ${value.asClassName}`
        : value.className;
      const importName = value.isDefault
        ? currentClassName
        : `{ ${currentClassName} }`;
      dynamicEntryFile = dynamicEntryFile.concat(
        `\nimport ${importName} from "file:${value.filePath?.replaceAll(
          "\\",
          "\\\\"
        )}"\n`
      );
    });

    dynamicEntryFile = dynamicEntryFile.concat(
      `\nconst MANDARINE_AUTOGENERATED_COMPONENTS_LIST = [${decoratorsArray
        .map((item) => item.asClassName || item.className)
        .join(", ")}];\n`
    ); // NEW LINE

    dynamicEntryFile = dynamicEntryFile.concat(
      "\nnew MandarineCore().MVC().run();\n"
    );

    const targetFileName = `./${MandarineConstants.MANDARINE_TARGET_FOLDER}/target.ts`;

    try {
      Deno.statSync(MandarineConstants.MANDARINE_TARGET_FOLDER);
    } catch {
      Deno.mkdirSync(MandarineConstants.MANDARINE_TARGET_FOLDER);
    }

    Deno.writeFileSync(
      targetFileName,
      new TextEncoder().encode(dynamicEntryFile)
    );

    let cmdEnvVariables: { [key: string]: string } = {};
    this.ENVIRONMENTAL_VARIABLES.forEach((item) => {
      const envVariableValue = Deno.env.get(item);
      if (envVariableValue) {
        cmdEnvVariables[item] = envVariableValue;
      }
    });

    let cmd = ["deno", "run"]
      .concat(config.flags)
      .concat(["--config", config.tsconfigPath]);
    if (config.reload) cmd = cmd.concat(["--reload"]);
    cmd = cmd.concat([targetFileName]);

    Deno.run({
      stderr: "inherit",
      stdin: "inherit",
      stdout: "inherit",
      cmd: cmd,
      env: cmdEnvVariables,
    }).status();
  }
}
