// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import { OpenAPIContact, OpenAPIExampleObject, OpenAPIExternalDocumentationObject, OpenAPIHeaderObject, OpenAPIInfo, OpenAPILicense, OpenAPILinkObject, OpenAPIParameter, OpenAPIPath, OpenAPIRequestBody, OpenAPIResponse, OpenAPISchemaObject, OpenAPISecuritySchemeObject, OpenAPIServer, OpenAPISpec, OpenAPITagObject, OPEN_API_VERSION, REF_OBJECT } from "./openapi-spec.ts";
import { IndependentUtils } from "../../main-core/utils/independentUtils.ts";
import  * as YAML from "https://deno.land/std@0.85.0/encoding/yaml.ts";

export class OpenAPIBuilder {
    private document: OpenAPISpec;
    private saveFilePath: string | URL | undefined  = undefined;

    constructor(docoument?: OpenAPISpec) {
        this.document = docoument || {
            openapi: OPEN_API_VERSION,
            info: {
                title: "App",
                version: "1.0.0"
            },
            servers: new Array<OpenAPIServer>(),
            paths: {},
            components: {
                schemas: {},
                responses: {},
                parameters: {},
                examples: {},
                requestBodies: {},
                headers: {},
                securitySchemes: {},
                links: {},
                callbacks: {},
            },
            tags: new Array<OpenAPITagObject>()
        };
    }

    /**
     * Gets current Open API document as a javascript object
     */
    public getSpec(): OpenAPISpec {
        return this.document;
    }

    /**
     * Gets current Open API Document as a JSON string
     */
    public toJSON(replacer?: (this: any, key: string, value: any) => any, space?: string | number): string {
        return JSON.stringify(this.document, replacer, space);
    }

    /**
     * Gets current Open API Document as a YAML string
     */
    public toYAML(): string {
        return YAML.stringify( <any> this.document);
    }

    /**
     * Sets a new Open API version to the document
     */
    public setOpenAPIVersion(version: string): OpenAPIBuilder {
        if(IndependentUtils.isVersionValidSemantic(version)) {
            this.document.openapi = version;
            return this;
        } else {
            throw new Error("Invalid OpenAPI version. Convention needs to follow semantic versioning.");
        }
    }

    /**
     * Sets the property info in the Open API Document
     */
    public setInfo(info: OpenAPIInfo): OpenAPIBuilder {
        this.document.info = info;
        return this;
    }

    /**
     * Sets the property `contact` inside the `info` object in the Open API Document
     */    
    public setContact(contact: OpenAPIContact): OpenAPIBuilder {
        this.document.info.contact = contact;
        return this;
    }

    /**
     * Sets the property `license` inside the `info` object in the Open API Document
     */    
    public setLicense(license: OpenAPILicense): OpenAPIBuilder {
        this.document.info.license = license;
        return this;
    }

    /**
     * Sets the property `title` inside the `info` object in the Open API Document
     */     
    public setTitle(title: string): OpenAPIBuilder {
        this.document.info.title = title;
        return this;
    }

    /**
     * Sets the property `description` inside the `info` object in the Open API Document
     */     
    public setDescription(description: string): OpenAPIBuilder {
        this.document.info.description = description;
        return this;
    }

    /**
     * Sets the property `termsOfService` inside the `info` object in the Open API Document
     */
    public setTermsOfService(termsOfService: string): OpenAPIBuilder {
        this.document.info.termsOfService = termsOfService;
        return this;
    }

    /**
     * Sets the property `version` inside the `info` object in the Open API Document
     */
    public setVersion(version: string): OpenAPIBuilder {
        this.document.info.version = version;
        return this;
    }

    /**
     * Adds a new path to the `paths` property in the Open API Document
     */
    public setPath(path: string, pathItem: OpenAPIPath): OpenAPIBuilder {
        if (this.document.paths[path]) {
          this.document.paths[path] = { ...this.document.paths[path], ...pathItem };
        } else {
          this.document.paths[path] = pathItem;
        }
        return this;
    }

    /**
     * Adds a new schema inside the components object in the Open API Document
     */
    public setSchema(name: string, schema: OpenAPISchemaObject | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.schemas[name] = schema;
        return this;
    }

    /**
     * Adds a new response inside the components object in the Open API Document
     */
    public setResponse(name: string, response: OpenAPIResponse| REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.responses[name] = response;
        return this;
    }

    /**
     * Adds a new parameter inside the components object in the Open API Document
     */    
    public setParameter(name: string, parameter: OpenAPIParameter | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.parameters[name] = parameter;
        return this;
    }

    /**
     * Adds a new example inside the components object in the Open API Document
     */
    public setExample(name: string, example: OpenAPIExampleObject | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.examples[name] = example;
        return this;
      }

    /**
     * Adds a new request body inside the components object in the Open API Document
     */
    public setRequestBody(name: string, reqBody: OpenAPIRequestBody | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.requestBodies[name] = reqBody;
        return this;
    }

    /**
     * Adds a new header inside the components object in the Open API Document
     */
    public setHeader(name: string, header: OpenAPIHeaderObject | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.headers[name] = header;
        return this;
    }

    /**
     * Adds a new security schema inside the components object in the Open API Document
     */
    public setSecurityScheme(name: string, secScheme: OpenAPISecuritySchemeObject | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.securitySchemes[name] = secScheme;
        return this;
    }

    /**
     * Adds a new link inside the components object in the Open API Document
     */
    public setLink(name: string, link: OpenAPILinkObject | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.links[name] = link;
        return this;
    }

    /**
     * Adds a new callback inside the components object in the Open API Document
     */
    public setCallback(name: string, callback: OpenAPIPath | REF_OBJECT): OpenAPIBuilder {
        // @ts-ignore
        this.document.components.callbacks[name] = callback;
        return this;
    }

    /**
     * Adds a new server in the Open API Document
     */
    public setServer(server: OpenAPIServer): OpenAPIBuilder {
        // @ts-ignore
        this.document.servers.push(server);
        return this;
    }

    /**
     * Adds a new tag in the Open API Document
     */
    public setTag(tag: OpenAPITagObject): OpenAPIBuilder {
        // @ts-ignore
        this.document.tags.push(tag);
        return this;
    }

    /**
     * Adds a new external documentation in the Open API Document
     */
    public setExternalDocs(extDoc: OpenAPIExternalDocumentationObject): OpenAPIBuilder {
        this.document.externalDocs = extDoc;
        return this;
    }

    /**
     * Set file to be saved when document is complete.
     * This method is only used internally by Mandarine
     */
    public setInternalSaveFile(path: string | URL) {
        this.saveFilePath = path;
    }

    /**
     * Gets the file to be saved when document is complete.
     * This method is only used internally by Mandarine
     */
    public getInternalSaveFile(): string | URL | undefined {
        return this.saveFilePath;
    }

}