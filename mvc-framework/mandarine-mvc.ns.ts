// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

import type { Context, Request, Response } from "../deps.ts";
import type { DI } from "../main-core/dependency-injection/di.ns.ts";
import type { MandarineSessionContainer } from "../main-core/mandarine-native/sessions/mandarineSessionContainer.ts";
import type { Mandarine } from "../mod.ts";
import type { Cookie as MandarineCookie } from "./core/interfaces/http/cookie.ts";
import { MandarineMVCContext } from "./core/mandarineMvcContext.ts";
import { RenderEngineClass } from "./core/modules/view-engine/renderEngine.ts";
import type { NonComponentMiddlewareTarget } from "../main-core/internals/interfaces/middlewareTarget.ts";
import type { GuardTarget } from "../main-core/internals/interfaces/guardTarget.ts";
import { MandarineMVCCache } from "./core/internal/mvcCacheManager.ts";

/**
* This namespace contains all the essentials for Mandarine MVC to work
*/
export namespace MandarineMvc {

    export const MVC_ABORT_CONTROLLER = new AbortController();

    /**
     * Hypertext Transfer Protocol (HTTP) response status codes.
     * @see {@link https://en.wikipedia.org/wiki/List_of_HTTP_status_codes}
     */
    export enum HttpStatusCode {

        /**
         * The server has received the request headers and the client should proceed to send the request body
         * (in the case of a request for which a body needs to be sent; for example, a POST request).
         * Sending a large request body to a server after a request has been rejected for inappropriate headers would be inefficient.
         * To have a server check the request's headers, a client must send Expect: 100-continue as a header in its initial request
         * and receive a 100 Continue status code in response before sending the body. The response 417 Expectation Failed indicates the request should not be continued.
         */
        CONTINUE = 100,

        /**
         * The requester has asked the server to switch protocols and the server has agreed to do so.
         */
        SWITCHING_PROTOCOLS = 101,

        /**
         * A WebDAV request may contain many sub-requests involving file operations, requiring a long time to complete the request.
         * This code indicates that the server has received and is processing the request, but no response is available yet.
         * This prevents the client from timing out and assuming the request was lost.
         */
        PROCESSING = 102,

        /**
         * Standard response for successful HTTP requests.
         * The actual response will depend on the request method used.
         * In a GET request, the response will contain an entity corresponding to the requested resource.
         * In a POST request, the response will contain an entity describing or containing the result of the action.
         */
        OK = 200,

        /**
         * The request has been fulfilled, resulting in the creation of a new resource.
         */
        CREATED = 201,

        /**
         * The request has been accepted for processing, but the processing has not been completed.
         * The request might or might not be eventually acted upon, and may be disallowed when processing occurs.
         */
        ACCEPTED = 202,

        /**
         * SINCE HTTP/1.1
         * The server is a transforming proxy that received a 200 OK from its origin,
         * but is returning a modified version of the origin's response.
         */
        NON_AUTHORITATIVE_INFORMATION = 203,

        /**
         * The server successfully processed the request and is not returning any content.
         */
        NO_CONTENT = 204,

        /**
         * The server successfully processed the request, but is not returning any content.
         * Unlike a 204 response, this response requires that the requester reset the document view.
         */
        RESET_CONTENT = 205,

        /**
         * The server is delivering only part of the resource (byte serving) due to a range header sent by the client.
         * The range header is used by HTTP clients to enable resuming of interrupted downloads,
         * or split a download into multiple simultaneous streams.
         */
        PARTIAL_CONTENT = 206,

        /**
         * The message body that follows is an XML message and can contain a number of separate response codes,
         * depending on how many sub-requests were made.
         */
        MULTI_STATUS = 207,

        /**
         * The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response,
         * and are not being included again.
         */
        ALREADY_REPORTED = 208,

        /**
         * The server has fulfilled a request for the resource,
         * and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
         */
        IM_USED = 226,

        /**
         * Indicates multiple options for the resource from which the client may choose (via agent-driven content negotiation).
         * For example, this code could be used to present multiple video format options,
         * to list files with different filename extensions, or to suggest word-sense disambiguation.
         */
        MULTIPLE_CHOICES = 300,

        /**
         * This and all future requests should be directed to the given URI.
         */
        MOVED_PERMANENTLY = 301,

        /**
         * This is an example of industry practice contradicting the standard.
         * The HTTP/1.0 specification (RFC 1945) required the client to perform a temporary redirect
         * (the original describing phrase was "Moved Temporarily"), but popular browsers implemented 302
         * with the functionality of a 303 See Other. Therefore, HTTP/1.1 added status codes 303 and 307
         * to distinguish between the two behaviours. However, some Web applications and frameworks
         * use the 302 status code as if it were the 303.
         */
        FOUND = 302,

        /**
         * SINCE HTTP/1.1
         * The response to the request can be found under another URI using a GET method.
         * When received in response to a POST (or PUT/DELETE), the client should presume that
         * the server has received the data and should issue a redirect with a separate GET message.
         */
        SEE_OTHER = 303,

        /**
         * Indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match.
         * In such case, there is no need to retransmit the resource since the client still has a previously-downloaded copy.
         */
        NOT_MODIFIED = 304,

        /**
         * SINCE HTTP/1.1
         * The requested resource is available only through a proxy, the address for which is provided in the response.
         * Many HTTP clients (such as Mozilla and Internet Explorer) do not correctly handle responses with this status code, primarily for security reasons.
         */
        USE_PROXY = 305,

        /**
         * No longer used. Originally meant "Subsequent requests should use the specified proxy."
         */
        SWITCH_PROXY = 306,

        /**
         * SINCE HTTP/1.1
         * In this case, the request should be repeated with another URI; however, future requests should still use the original URI.
         * In contrast to how 302 was historically implemented, the request method is not allowed to be changed when reissuing the original request.
         * For example, a POST request should be repeated using another POST request.
         */
        TEMPORARY_REDIRECT = 307,

        /**
         * The request and all future requests should be repeated using another URI.
         * 307 and 308 parallel the behaviors of 302 and 301, but do not allow the HTTP method to change.
         * So, for example, submitting a form to a permanently redirected resource may continue smoothly.
         */
        PERMANENT_REDIRECT = 308,

        /**
         * The server cannot or will not process the request due to an apparent client error
         * (e.g., malformed request syntax, too large size, invalid request message framing, or deceptive request routing).
         */
        BAD_REQUEST = 400,

        /**
         * Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet
         * been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the
         * requested resource. See Basic access authentication and Digest access authentication. 401 semantically means
         * "unauthenticated",i.e. the user does not have the necessary credentials.
         */
        UNAUTHORIZED = 401,

        /**
         * Reserved for future use. The original intention was that this code might be used as part of some form of digital
         * cash or micro payment scheme, but that has not happened, and this code is not usually used.
         * Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.
         */
        PAYMENT_REQUIRED = 402,

        /**
         * The request was valid, but the server is refusing action.
         * The user might not have the necessary permissions for a resource.
         */
        FORBIDDEN = 403,

        /**
         * The requested resource could not be found but may be available in the future.
         * Subsequent requests by the client are permissible.
         */
        NOT_FOUND = 404,

        /**
         * A request method is not supported for the requested resource;
         * for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
         */
        METHOD_NOT_ALLOWED = 405,

        /**
         * The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.
         */
        NOT_ACCEPTABLE = 406,

        /**
         * The client must first authenticate itself with the proxy.
         */
        PROXY_AUTHENTICATION_REQUIRED = 407,

        /**
         * The server timed out waiting for the request.
         * According to HTTP specifications:
         * "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time."
         */
        REQUEST_TIMEOUT = 408,

        /**
         * Indicates that the request could not be processed because of conflict in the request,
         * such as an edit conflict between multiple simultaneous updates.
         */
        CONFLICT = 409,

        /**
         * Indicates that the resource requested is no longer available and will not be available again.
         * This should be used when a resource has been intentionally removed and the resource should be purged.
         * Upon receiving a 410 status code, the client should not request the resource in the future.
         * Clients such as search engines should remove the resource from their indices.
         * Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.
         */
        GONE = 410,

        /**
         * The request did not specify the length of its content, which is required by the requested resource.
         */
        LENGTH_REQUIRED = 411,

        /**
         * The server does not meet one of the preconditions that the requester put on the request.
         */
        PRECONDITION_FAILED = 412,

        /**
         * The request is larger than the server is willing or able to process. Previously called "Request Entity Too Large".
         */
        PAYLOAD_TOO_LARGE = 413,

        /**
         * The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request,
         * in which case it should be converted to a POST request.
         * Called "Request-URI Too Long" previously.
         */
        URI_TOO_LONG = 414,

        /**
         * The request entity has a media type which the server or resource does not support.
         * For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format.
         */
        UNSUPPORTED_MEDIA_TYPE = 415,

        /**
         * The client has asked for a portion of the file (byte serving), but the server cannot supply that portion.
         * For example, if the client asked for a part of the file that lies beyond the end of the file.
         * Called "Requested Range Not Satisfiable" previously.
         */
        RANGE_NOT_SATISFIABLE = 416,

        /**
         * The server cannot meet the requirements of the Expect request-header field.
         */
        EXPECTATION_FAILED = 417,

        /**
         * This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol,
         * and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by
         * teapots requested to brew coffee. This HTTP status is used as an Easter egg in some websites, including Google.com.
         */
        I_AM_A_TEAPOT = 418,

        /**
         * The request was directed at a server that is not able to produce a response (for example because a connection reuse).
         */
        MISDIRECTED_REQUEST = 421,

        /**
         * The request was well-formed but was unable to be followed due to semantic errors.
         */
        UNPROCESSABLE_ENTITY = 422,

        /**
         * The resource that is being accessed is locked.
         */
        LOCKED = 423,

        /**
         * The request failed due to failure of a previous request (e.g., a PROPPATCH).
         */
        FAILED_DEPENDENCY = 424,

        /**
         * The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.
         */
        UPGRADE_REQUIRED = 426,

        /**
         * The origin server requires the request to be conditional.
         * Intended to prevent "the 'lost update' problem, where a client
         * GETs a resource's state, modifies it, and PUTs it back to the server,
         * when meanwhile a third party has modified the state on the server, leading to a conflict."
         */
        PRECONDITION_REQUIRED = 428,

        /**
         * The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.
         */
        TOO_MANY_REQUESTS = 429,

        /**
         * The server is unwilling to process the request because either an individual header field,
         * or all the header fields collectively, are too large.
         */
        REQUEST_HEADER_FIELDS_TOO_LARGE = 431,

        /**
         * A server operator has received a legal demand to deny access to a resource or to a set of resources
         * that includes the requested resource. The code 451 was chosen as a reference to the novel Fahrenheit 451.
         */
        UNAVAILABLE_FOR_LEGAL_REASONS = 451,

        /**
         * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
         */
        INTERNAL_SERVER_ERROR = 500,

        /**
         * The server either does not recognize the request method, or it lacks the ability to fulfill the request.
         * Usually this implies future availability (e.g., a new feature of a web-service API).
         */
        NOT_IMPLEMENTED = 501,

        /**
         * The server was acting as a gateway or proxy and received an invalid response from the upstream server.
         */
        BAD_GATEWAY = 502,

        /**
         * The server is currently unavailable (because it is overloaded or down for maintenance).
         * Generally, this is a temporary state.
         */
        SERVICE_UNAVAILABLE = 503,

        /**
         * The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
         */
        GATEWAY_TIMEOUT = 504,

        /**
         * The server does not support the HTTP protocol version used in the request
         */
        HTTP_VERSION_NOT_SUPPORTED = 505,

        /**
         * Transparent content negotiation for the request results in a circular reference.
         */
        VARIANT_ALSO_NEGOTIATES = 506,

        /**
         * The server is unable to store the representation needed to complete the request.
         */
        INSUFFICIENT_STORAGE = 507,

        /**
         * The server detected an infinite loop while processing the request.
         */
        LOOP_DETECTED = 508,

        /**
         * Further extensions to the request are required for the server to fulfill it.
         */
        NOT_EXTENDED = 510,

        /**
         * The client needs to authenticate to gain network access.
         * Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used
         * to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).
         */
        NETWORK_AUTHENTICATION_REQUIRED = 511
    }

    /**
    * Contains all the Media Types possible in the internet
    */
    export enum MediaTypes {
        APPLICATION_JAVA_ARCHIVE = "application/java-archive",
        APPLICATION_MSWORD = "application/msword",
        APPLICATION_EDI_X12 = "application/EDI-X12",
        APPLICATION_EDIFACT = "application/EDIFACT",
        APPLICATION_JAVASCRIPT = "application/javascript",
        APPLICATION_OCTET_STREAM = "application/octet-stream",
        APPLICATION_OGG = "application/ogg",
        APPLICATION_PDF = "application/pdf",
        APPLICATION_XHTML_XML = "application/xhtml+xml",
        APPLICATION_X_SHOCKWAVE_FLASH = "application/x-shockwave-flash",
        APPLICATION_JSON = "application/json",
        APPLICATION_LD_JSON = "application/ld+json",
        APPLICATION_XML = "application/xml",
        APPLICATION_ZIP = "application/zip",
        APPLICATION_X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded",
    
        AUDIO_MPEG = "audio/mpeg",
        AUDIO_X_MS_WMA = "audio/x-ms-wma",
        AUDIO_VND_RN_REALAUDIO = "audio/vnd.rn-realaudio",
        AUDIO_X_WAV = "audio/x-wav",
    
        IMAGE_GIF = "image/gif",
        IMAGE_JPEG = "image/jpeg",
        IMAGE_PNG = "image/png",
        IMAGE_TIFF = "image/tiff",
        IMAGE_VND_MICROSOFT_ICON = "image/vnd.microsoft.icon",
        IMAGE_X_ICON = "image/x-icon",
        IMAGE_VND_DJVU = "image/vnd.djvu",
        IMAGE_SVG_XML = "image/svg+xml",
    
        MULTIPART_MIXED = "multipart/mixed",
        MULTIPART_ALTERNATIVE = "multipart/alternative",
        MULTIPART_RELATED = "multipart/related",
        MULTIPART_FORM_DATA = "multipart/form-data",
    
        TEXT_CSS = "text/css",
        TEXT_CSV = "text/csv",
        TEXT_HTML = "text/html",
        TEXT_PLAIN = "text/plain",
        TEXT_XML = "text/xml",
    
        VIDEO_MPEG = "video/mpeg",
        VIDEO_MP4 = "video/mp4",
        VIDEO_QUICKTIME = "video/quicktime",
        VIDEO_X_MS_WMV = "video/x-ms-wmv",
        VIDEO_X_MSVIDEO = "video/x-msvideo",
        VIDEO_X_FLV = "video/x-flv",
        VIDEO_WEBM = "video/webm",
    
        VND_ANDROID_PACKAGE_ARCHIVE = "application/vnd.android.package-archive",
        VND_OASIS_OPENDOCUMENT_TEXT = "application/vnd.oasis.opendocument.text",
        VND_OASIS_OPENDOCUMENT_SPREADSHEET = "application/vnd.oasis.opendocument.spreadsheet",
        VND_OASIS_OPENDOCUMENT_PRESENTATION = "application/vnd.oasis.opendocument.presentation",
        VND_OASIS_OPENDOCUMENT_GRAPHICS = "application/vnd.oasis.opendocument.graphics",
        VND_MSEXCEL = "application/vnd.ms-excel",
        VND_OPENXMLFORMATS_OFFICEDOCUMENT_SPREADSHEETML_SHEET = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        VND_MS_POWERPOINT = "application/vnd.ms-powerpoint",
        VND_OPENXMLFORMATS_OFFICEDOCUMENT_PRESENTATIONML_PRESENTATION = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        VND_OPENXMLFORMATS_OFFICEDOCUMENT_WORDPROCESSINGML_DOCUMENT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        VND_MOZILLA_XUL_XML = "application/vnd.mozilla.xul+xml"
    }

    /**
    * Contains all the HTTP Methods available.
    */
    export enum HttpMethods {
        GET,
        POST,
        PUT,
        HEAD,
        DELETE,
        PATCH,
        OPTIONS
    }

    /**
    * Refers to all the information the Routing handlers need to work out.
    */
    export namespace Routing {

        /**
        * Refers to the status of a route at compile-time.
        */
        export enum RouteInitializationStatus {
            PRECREATED,
            CREATED
        }

        /**
        * Refers to the possible configurations a route can have.
        */
        export interface RoutingOptions {
            responseStatus?: HttpStatusCode,
            cors?: CorsMiddlewareOption,
            withPermissions?: Mandarine.Security.Auth.Permissions,
            middleware?: Array<NonComponentMiddlewareTarget | Mandarine.Types.MiddlewareComponent>;
            guards?: Array<Function | GuardTarget>
            [key: string]: any
        };

        /**
        * Refers to the information of a param in a route.
        * /:name <----- for example
        */
        export interface RoutingParams {
            relation?: {
                controller: string;
                methodName?: string;
            };
            routeName?: string;
            routeIndex?: number;
        }

        /**
        * Contains the information the Mandarine MVC engine will need in order to read & execute an endpoint.
        * When an endpoint is requested, the routing action indicates how the Mandarine MVC engine should behave.
        */
        export interface RoutingAction {
            actionParent?: string;
            actionType: HttpMethods,
            actionMethodName: string; 
            route: string;
            routingOptions?: RoutingOptions;
            routeParams?: RoutingParams[];
            routeSignature: Array<string>;
            initializationStatus: RouteInitializationStatus;
        }

        /**
        * Contains the metadata information of a route. Like its controller and the method that should be executed.
        * @GET, @POST, @PUT, and the others contain this information at compile-time
        */
        export interface RoutingAnnotationContext {
            route: string;
            methodType: HttpMethods;
            methodName: string;
            options: RoutingOptions;
            className?: string;
        }
    }

    /**
    * Refers to all the internal functioning (in MVC) that is used by Mandarine's core.
    */
    export namespace Internal {
        export enum MiddlewareType {
            CORS,
            RESPONSE_TIME,
            SESSION_COOKIE,
            SESSION_STORE
        }

        export type InternalMiddlewareFunc = (context: Mandarine.Types.RequestContext, data?: any) => boolean;

        export type InternalMiddlewareLifecycle = "PRE" | "POST" | "ALL";

        export interface InternalMiddleware {
            type: MiddlewareType;
            caller: InternalMiddlewareFunc;
            configurationFlag: {
                key: string,
                expectedValue: any
            };
            enabled: boolean;
            lifecycle: InternalMiddlewareLifecycle;
        }

        export namespace Core {
            export interface CacheItem {
                key: string;
                object: any;
                expiration: Date;
            }

            export const getCacheManager = () => {
                return MandarineMVCCache.getInstance();
            }
        }
    }

    export interface ResponseStatusMetadataContext {
        responseStatus: Mandarine.MandarineMVC.HttpStatusCode;
        methodName?: string;
    }
    
    export interface routingParamContext {
        methodName: string;
        parameterName: string;
        parameterIndex: number;
        parameterType: DI.InjectionTypes;
        className?: string;
    }

    /**
     * Information used by CORS decorator & CORS Middleware for functionality
     */
    export interface CorsMiddlewareOption {
        origin: string | RegExp | Array<string | RegExp>;
        methods?: Array<string>;
        allowedHeaders?: Array<string>;
        exposedHeaders?: Array<string>;
        credentials?: boolean;
        maxAge?: number;
        optionsSuccessStatus?: number;
    }

    /**
     * Interface of object returned when using decorator `@RequestBody()` in request which data is of `Multipart/form-data`
     */
    export interface MultipartFormData {
        fields?: {
            [prop: string]: any
        },
        files?: {
            [filename: string]: Uint8Array | Uint16Array | Uint32Array | BigUint64Array
        }
    }

    export interface MultipartHeader {
        name: string,
        isFile: boolean
    };

    export interface Cookie extends MandarineCookie {
    }

    /**
     * Interface of object returned when using decorator `@Parameters()`.
     * @field `query` returns an object with keys & values of query parameters
     * @field `route` returns an object with keys & values of route parameters.
     */
    export interface AllParameters {
        query: {
            [prop: string]: any;
        },
        route: {
            [prop: string]: any;
        }
    }

    export interface ResponseContext extends Response {}

    export interface RequestDataContext extends Request {
        authentication: Mandarine.Security.Auth.RequestAuthObj;
        sessionContext: Mandarine.Security.Sessions.MandarineSession;
        sessionID: string;
        session: any;
    }

    export interface RequestTimeContext {
        startedAt: number;
        finishedAt: number;
    }

    export interface RequestContext extends Context {
        params: any;
        request: RequestDataContext;
        isResource: boolean;
        timeMetadata: RequestTimeContext;
    }

    export interface RequestContextAccessor {
        getFullContext(): RequestContext;
        getRequest(): RequestDataContext;
        getResponse(): ResponseContext;
    }

    /**
     * Interface used for the custom decorator executor.
     * Custom Decorator Executor refers to the context of a mandarine-powered decorator created by the user.
     */
    export type CustomDecoratorExecutor<DecoratorData = any, DecoratorReturn = any> = (context: Mandarine.Types.RequestContextAcessor, 
                                                                                       ...data: Array<DecoratorData>) => DecoratorReturn;
                                            

    /**
     * Metadata & information of a Mandarine-generated decorator through custom decorators
     */                                                                                   
    export interface DecoratorFactoryData<DecoratorData, DecoratorReturn> {
        provider: CustomDecoratorExecutor;
        paramData: Array<any>;
    }                                                                                   
    /**
     * Refers to all the information that the rendering engine needs to work out.
     */
    export namespace TemplateEngine {
        /**
         * Supported view engines by mandarine
         */
        export enum Engines {
            HANDLEBARS = "handlebars",
            EJS = "ejs"
        }

        /**
         * Decorators information related to the view engine/template engine
         */
        export namespace Decorators {
            export interface RenderData {
                className: string,
                template: string,
                engine: TemplateEngine.Engines,
                options: RenderingOptions
            }
        }

        /**
         * Information of the template registered in the templates' registry
         */
        export interface Template {
            templateFullPath: string,
            engine: TemplateEngine.Engines,
            content: string
        }

        /**
         * If manual is set to true then the template is defined in the decorator @Render
         */
        export interface RenderingOptions {
            manual: boolean;
        }

        export class RenderEngine extends RenderEngineClass {}
    }

    export namespace Configurers {
        export interface WebMVCConfigurer {
            getSessionContainer?(): MandarineSessionContainer;
            addResourceHandlers?(): Mandarine.MandarineCore.IResourceHandlerRegistry;
            authManagerBuilder?(provider?: Mandarine.Security.Auth.AuthenticationManagerBuilder): Mandarine.Security.Auth.AuthenticationManagerBuilder;
            httpLoginBuilder?(provider?: Mandarine.Security.Core.Modules.LoginBuilder): Mandarine.Security.Core.Modules.LoginBuilder;
        }
    }

    export namespace HTTPResolvers {

        /**
         * Resolves the requested resource.
         * @param httpContext is injected
         * @param resourcePath is injected
         */
        export interface ResourceResolver {
            resolve(httpContext: Mandarine.Types.RequestContext, resourcePath: string): Promise<Uint8Array | undefined>;
        }

    }
}

(() => {
    // Initialize MVC Context
    MandarineMVCContext.getInstance();
})();