# Multipart Form Data

Mandarine allows you to receive multipart/form-data in incoming requests. You can receive both _properties_ and _files_ from a _multipart request_.

----

## Accessing A Multipart Body
Mandarine automatically handles the reading and parsing of `multipart/form-data` requests. This means, you do not have to do any extra code in order to access its data and the different structure it may have such as properties or files.

To access your `multipart` body, you will need to make use of the decorator `@RequestBody()` which is part of [HTTP Parameter Decorators](/docs/mandarine/http-handlers). 

If the content type of your request is equivalent to `multipart/form-data` then `@RequestBody()` will return an object of `Mandarine.MandarineMVC.MultipartFormData` which will contain your properties and files if any.

See [Mandarine.MandarineMVC.MultipartFormData](https://doc.deno.land/https/raw.githubusercontent.com/mandarineorg/mandarinets/master/mvc-framework/mandarine-mvc.ns.ts#MandarineMvc.MultipartFormData)

`Mandarine.MandarineMVC.MultipartFormData` is an interface which contains the following structure:
```typescript
export interface MultipartFormData {
    fields?: {
        [prop: string]: any
    },
    files?: {
        [filename: string]: Uint8Array | Uint16Array | Uint32Array | BigUint64Array
    }
}
```

> The key of the a property (`MultipartFormData.fields`) is the key of the Multipart form. However, the key of a file is the name of the file that was sent, which would mean if you are sending a file with the name of image.png you would access to it in the following way:
```typescript

let obj: MultipartFormData = ...
obj.files["image.png"]
```

> **Note** Properties/fields can return anything but most likely a string, number or boolean. However, files return a binary interpretation that can be used by both Deno & Typescript. In most cases, a file will return `Uint8Array`, however, many binary interpretations are available. 
