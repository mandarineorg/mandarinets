export interface MiddlewareTarget {
    onPreRequest(...args): boolean;
    onPostRequest(...args): void;
}