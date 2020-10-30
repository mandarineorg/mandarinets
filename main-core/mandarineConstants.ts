// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

export class MandarineConstants {

    public static RELEASE_VERSION = "v2.2.0";

    public static readonly REFLECTION_MANDARINE_INJECTION_FIELD = "mandarine-method-di-field";
    public static readonly REFLECTION_MANDARINE_PIPE_FIELD = "mandarine-method-parameter-pipe";
    public static readonly REFLECTION_MANDARINE_METHOD_ROUTE = "mandarine-method-route";
    public static readonly REFLECTION_MANDARINE_COMPONENT = "mandarine-component";
    public static readonly REFLECTION_MANDARINE_CONTROLLER_DEFAULT_HTTP_RESPONSE_CODE = "mandarine-default-http-response-code";
    public static readonly REFLECTION_MANDARINE_CONTROLLER_CORS_MIDDLEWARE = "mandarine-controller-cors";
    public static readonly REFLECTION_MANDARINE_PROPERTIES_ANNOTATION = "mandarine-manual-properties";
    public static readonly REFLECTION_MANDARINE_INJECTABLE_FIELD = "mandarine-injectable-field";
    public static readonly REFLECTION_MANDARINE_TABLE_ENTITY = "mandarine-table-entity";
    public static readonly REFLECTION_MANDARINE_TABLE_COLUMN = "mandarine-table-column";
    public static readonly REFLECTION_MANDARINE_TABLE_COLUMN_PROPERTY = "mandarine-table-column-property";
    public static readonly REFLECTION_MANDARINE_REPOSITORY_METHOD_MANUAL_QUERY = "mandarine-repository-manual-query";
    public static readonly REFLECTION_MANDARINE_METHOD_ROUTE_RENDER = "mandarine-method-route-render";
    public static readonly REFLECTION_HTTP_ACTION_KEY = "httpAction";
    public static readonly REFLECTION_MANDARINE_SECURITY_ALLOWONLY_DECORATOR = "mandarine-security-allow-only";
    public static readonly REFLECTION_MANDARINE_USE_MIDDLEWARE_DECORATOR = "mandarine-use-middleware";
    public static readonly REFLECTION_MANDARINE_USE_GUARDS_DECORATOR = "mandarine-use-guards";

    // SECURITY
    public static readonly SECURITY_AUTH_COOKIE_NAME = "MDAUTHID";

    public static MANDARINE_COPYRIGHT_HEADER = "Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.";

    public static MANDARINE_FILE_GLOBS: Array<string> = [
        "./cli/**/*.ts",
        "./logger/**/*.ts",
        "./main-core/**/*.ts",
        "./mvc-framework/**/*.ts",
        "./orm-core/**/*.ts",
        "./rust-core/**/*.ts",
        "./pluggins/**/*.ts",
        "./security-core/**/*.ts",
        "./tests/**/*.ts",
        "./cli.ts",
        "./deps.ts",
        "./mod.ts"
    ];

    public static MANDARINE_TARGET_FOLDER = ".mandarine_target";

}