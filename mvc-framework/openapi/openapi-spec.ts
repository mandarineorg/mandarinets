
export const OPEN_API_VERSION = "3.0.3";
export type REF_OBJECT = { $ref: string };
export type WithAny = { [prop: string]: any }

export type OpenAPIParameterStyle =
  | "matrix"
  | "label"
  | "form"
  | "simple"
  | "spaceDelimited"
  | "pipeDelimited"
  | "deepObject";

export type OpenAPISecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

export interface OpenAPIDiscriminatorObject {
    propertyName: string;
    mapping?: { [key: string]: string };
}
export interface OpenAPIXmlObject extends WithAny {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
}

export interface OpenAPIExternalDocumentationObject extends WithAny {
    description?: string;
    url: string;
}

export interface OpenAPIExamplesObject {
    [name: string]: OpenAPIExampleObject | REF_OBJECT;
  }

export interface OpenAPIExampleObject {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
    [property: string]: any;
}

export interface OpenAPIEncodingPropertyObject {
    contentType?: string;
    headers?: { [key: string]: OpenAPIHeaderObject | REF_OBJECT };
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    [key: string]: any;
}

export interface OpenAPIEncodingObject extends WithAny {
    // [property: string]: EncodingPropertyObject;
    [property: string]: OpenAPIEncodingPropertyObject | any;
}

export interface OpenAPIMediaTypeObject extends WithAny {
    schema?: OpenAPISchemaObject | REF_OBJECT;
    examples?: OpenAPIExamplesObject;
    example?: any;
    encoding?: OpenAPIEncodingObject;
}

export interface OpenAPIContentObject {
    [mediatype: string]: OpenAPIMediaTypeObject;
}

export interface OpenAPIBaseParameterObject extends WithAny {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
  
    style?: OpenAPIParameterStyle;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: OpenAPISchemaObject | REF_OBJECT;
    examples?: { [param: string]: OpenAPIExampleObject | REF_OBJECT };
    example?: any;
    content?: OpenAPIContentObject;
}

export interface OpenAPIHeaderObject extends OpenAPIBaseParameterObject {}

export interface OpenAPIContact {
    name: string;
    url: string;
    email: string;
}
export interface OpenAPILicense {
    name: string;
    url?: string;
}
export interface OpenAPIInfo {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: OpenAPIContact;
    license?: OpenAPILicense;
    version: string;
}
export interface OpenAPIServerVariables {
    enum?: string;
    default: string;
    description?: string;
}
export interface OpenAPIServer {
    url: string;
    description?: string;
    variables?: {
        [prop: string]: OpenAPIServerVariables
    }
}
export interface OpenAPIExternalDocs {
    description?: string;
    url: string;
}
export interface OpenAPIParameter {
    in?: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    schema?: OpenAPISchemaObject
}
export interface OpenAPISchemaObject extends WithAny {
    nullable?: boolean;
    discriminator?: OpenAPIDiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: OpenAPIXmlObject;
    externalDocs?: OpenAPIExternalDocumentationObject;
    example?: any;
    examples?: any[];
    deprecated?: boolean;
  
    type?: string;
    allOf?: (OpenAPISchemaObject | REF_OBJECT)[];
    oneOf?: (OpenAPISchemaObject | REF_OBJECT)[];
    anyOf?: (OpenAPISchemaObject | REF_OBJECT)[];
    not?: OpenAPISchemaObject | REF_OBJECT;
    items?: OpenAPISchemaObject | REF_OBJECT;
    properties?: { [propertyName: string]: OpenAPISchemaObject | REF_OBJECT };
    additionalProperties?: OpenAPISchemaObject | REF_OBJECT | boolean;
    description?: string;
    format?: string;
    default?: any;
  
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
}
export interface OpenAPILinkObject extends WithAny {
    operationRef?: string;
    operationId?: string;
    parameters?: { [name: string]: any | string };
    requestBody?: any | string;
    description?: string;
    server?: OpenAPIServer;
    [property: string]: any;
}  
export interface OpenAPIRequestBody {
    description?: string;
    content: {
        [prop: string]: OpenAPISchemaObject
    }
    required?: boolean;
}
export interface OpenAPIContent {
    [mediatype: string]: OpenAPIMediaTypeObject;
  }
export interface OpenAPIResponse {
    description: string;
    responseCode?: number;
    headers?: {
        [prop: string]: OpenAPIHeaderObject | REF_OBJECT
    },
    content?: {
        [prop: string]: OpenAPIContent
    },
    links?: {
        [prop: string]: OpenAPILinkObject | REF_OBJECT
    }
}
export type OpenAPIResponseGeneral = {
    [prop in string | number]: OpenAPIResponse | REF_OBJECT;
} & {
    default: OpenAPIResponse | REF_OBJECT;
};
export interface OpenAPIOperationObject {
    tags?: Array<string>;
    hidden?: boolean;
    summary?: string;
    description?: string;
    externalDocs?: OpenAPIExternalDocs;
    operationId?: string;
    parameters?: Array<OpenAPIParameter | REF_OBJECT>;
    requestBody?: OpenAPIRequestBody | REF_OBJECT;
    responses: OpenAPIResponseGeneral;
    callbacks?: {
        [prop: string]: OpenAPIPath | REF_OBJECT | any;
    },
    deprecated?: boolean;
    security?: {
        [name: string]: string[];
    },
    servers?: Array<OpenAPIServer>
}

export interface OpenAPIPath {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: OpenAPIOperationObject;
    put?: OpenAPIOperationObject;
    delete?: OpenAPIOperationObject;
    options?: OpenAPIOperationObject;
    head?: OpenAPIOperationObject;
    patch?: OpenAPIOperationObject;
    trace?: OpenAPIOperationObject;
    servers?: Array<OpenAPIServer>;
    parameters?: Array<OpenAPIParameter>;
}

export interface OpenAPIOAuthFlowObject extends WithAny {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: {
        [scope: string]: any
    };
}
  
export interface OpenAPIOAuthFlowsObject extends WithAny {
    implicit?: OpenAPIOAuthFlowObject;
    password?: OpenAPIOAuthFlowObject;
    clientCredentials?: OpenAPIOAuthFlowObject;
    authorizationCode?: OpenAPIOAuthFlowObject;
}

export interface OpenAPISecuritySchemeObject extends WithAny {
    type: OpenAPISecuritySchemeType;
    description?: string;
    name?: string; 
    in?: string; 
    scheme?: string; 
    bearerFormat?: string;
    flows?: OpenAPIOAuthFlowsObject; 
    openIdConnectUrl?: string;
  }

export interface OpenAPIComponentObject {
    schemas?: {
        [prop: string]: OpenAPISchemaObject | REF_OBJECT
    },
    responses?: {
        [prop: string]: OpenAPIResponse | REF_OBJECT
    },
    parameters?: {
        [prop: string]: OpenAPIParameter | REF_OBJECT
    },
    examples?: {
        [prop: string]: OpenAPIExampleObject | REF_OBJECT
    },
    requestBodies?: {
        [prop: string]: OpenAPIRequestBody | REF_OBJECT
    },
    headers?: {
        [prop: string]: OpenAPIHeaderObject | REF_OBJECT
    },
    securitySchemes?: {
        [prop: string]: OpenAPISecuritySchemeObject | REF_OBJECT
    },
    links?: {
        [prop: string]: OpenAPILinkObject | REF_OBJECT
    },
    callbacks?: {
        [prop: string]: OpenAPIPath | REF_OBJECT | any;
    }
}

export interface OpenAPITagObject {
    name: string;
    description?: string;
    externalDocs?: OpenAPIExternalDocumentationObject;
}

export interface OpenAPISpec {
    openapi: string;
    info: OpenAPIInfo;
    servers?: Array<OpenAPIServer>;
    paths: {
        [path: string]: OpenAPIPath | REF_OBJECT
    },
    components?: OpenAPIComponentObject,
    security?: {
        [prop: string]: Array<string>
    },
    tags?: Array<OpenAPITagObject>;
    externalDocs?: OpenAPIExternalDocumentationObject
}