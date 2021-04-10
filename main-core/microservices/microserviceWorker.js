function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message2){
        super(message2);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    name = "BufferFullError";
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
    }
}
class PartialReadError extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd1, size1 = 4096){
        if (size1 < 16) {
            size1 = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size1), rd1);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial: partial1  } = err;
            assert(partial1 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial1.byteLength > 0 && partial1[partial1.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial1 = partial1.subarray(0, partial1.byteLength - 1);
            }
            return {
                line: partial1,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer1, size2 = 4096){
        super();
        this.writer = writer1;
        if (size2 <= 0) {
            size2 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size2);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer2, size3 = 4096){
        super();
        this.writer = writer2;
        if (size3 <= 0) {
            size3 = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size3);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const encoder = new TextEncoder();
const decoder = new TextDecoder();
class ClientUtil {
    static getDefaultPort(transporterType) {
        switch(transporterType){
            case "TCP":
                throw new Error("Transporter TCP requires port to be assigned");
            case "REDIS":
                return 6379;
            case "AMQP":
                return 5672;
            case "NATS":
                return 4222;
            default:
                throw new Error("Default port cannot be read because transporter is not part of the built-in clients");
        }
    }
    static resizeTypedArray(baseArrayBuffer, newByteSize) {
        var resizedArrayBuffer = new ArrayBuffer(newByteSize), len = baseArrayBuffer.byteLength, resizeLen = len > newByteSize ? newByteSize : len;
        new Uint8Array(resizedArrayBuffer, 0, resizeLen).set(new Uint8Array(baseArrayBuffer, 0, resizeLen));
        return resizedArrayBuffer;
    }
}
function charCode(type) {
    return type.charCodeAt(0);
}
function fromCharCode(code) {
    return new TextDecoder().decode(new Uint8Array([
        code
    ]));
}
var TableFieldType;
(function(TableFieldType1) {
    TableFieldType1[TableFieldType1["Boolean"] = charCode("t")] = "Boolean";
    TableFieldType1[TableFieldType1["ShortShortInt"] = charCode("b")] = "ShortShortInt";
    TableFieldType1[TableFieldType1["ShortShortUInt"] = charCode("B")] = "ShortShortUInt";
    TableFieldType1[TableFieldType1["ShortInt"] = charCode("s")] = "ShortInt";
    TableFieldType1[TableFieldType1["ShortUInt"] = charCode("u")] = "ShortUInt";
    TableFieldType1[TableFieldType1["LongInt"] = charCode("I")] = "LongInt";
    TableFieldType1[TableFieldType1["LongUInt"] = charCode("i")] = "LongUInt";
    TableFieldType1[TableFieldType1["LongLongInt"] = charCode("l")] = "LongLongInt";
    TableFieldType1[TableFieldType1["Float"] = charCode("f")] = "Float";
    TableFieldType1[TableFieldType1["Double"] = charCode("d")] = "Double";
    TableFieldType1[TableFieldType1["Decimal"] = charCode("D")] = "Decimal";
    TableFieldType1[TableFieldType1["LongStr"] = charCode("S")] = "LongStr";
    TableFieldType1[TableFieldType1["FieldArray"] = charCode("A")] = "FieldArray";
    TableFieldType1[TableFieldType1["Timestamp"] = charCode("T")] = "Timestamp";
    TableFieldType1[TableFieldType1["FieldTable"] = charCode("F")] = "FieldTable";
    TableFieldType1[TableFieldType1["NoValue"] = charCode("V")] = "NoValue";
    TableFieldType1[TableFieldType1["ByteArray"] = charCode("x")] = "ByteArray";
})(TableFieldType || (TableFieldType = {
}));
function padArray(array, size4, value) {
    const padding = Array.from({
        length: size4 - array.length
    }).fill(value);
    return array.concat(...padding);
}
function charCode1(type) {
    return type.charCodeAt(0);
}
function assertUnreachable(_x) {
    throw new Error(`Unreachable code executed`);
}
class AmqpDecoder {
    #data;
    #offset=0;
    #view;
    #textDecoder;
    #bitField=null;
    #bitPointer=7;
    constructor(data1){
        this.#data = data1;
        this.#view = new DataView(data1.buffer);
        this.#textDecoder = new TextDecoder();
    }
    #forward=(n)=>{
        const current = this.#offset;
        this.#offset += n;
        if (this.#offset > this.#data.length) {
            throw new Error("Not enough data in decoder");
        }
        return current;
    };
    #uint8=()=>this.#view.getUint8(this.#forward(1))
    ;
    #uint16=()=>this.#view.getUint16(this.#forward(2))
    ;
    #uint32=()=>this.#view.getUint32(this.#forward(4))
    ;
    #uint64=()=>{
        const result = Number(this.#view.getBigUint64(this.#forward(8)));
        if (!Number.isSafeInteger(result)) {
            throw new Error(`Tried to decode unsafe integer`);
        }
        return result;
    };
    #int8=()=>this.#view.getInt8(this.#forward(1))
    ;
    #int16=()=>this.#view.getInt16(this.#forward(2))
    ;
    #int32=()=>this.#view.getInt32(this.#forward(4))
    ;
    #int64=()=>{
        const num = Number(this.#view.getBigInt64(this.#forward(8)));
        if (!Number.isSafeInteger(num)) {
            throw new Error(`Received unsafe integer`);
        }
        return num;
    };
    #float32=()=>{
        return this.#view.getFloat32(this.#forward(4));
    };
    #float64=()=>{
        return this.#view.getFloat64(this.#forward(8));
    };
    #bytes=(length)=>{
        const start = this.#forward(length);
        return this.#data.slice(start, this.#offset);
    };
    #text=(length)=>{
        return this.#textDecoder.decode(this.#bytes(length));
    };
    #shortstr=()=>{
        const size4 = this.#uint8();
        return this.#text(size4);
    };
    #longstr=()=>{
        const size4 = this.#uint32();
        return this.#text(size4);
    };
    #bit=()=>{
        if (this.#bitField === null || this.#bitPointer < 0) {
            this.#bitField = this.#uint8();
            this.#bitPointer = 7;
        }
        const value = !!(this.#bitField & 1 << this.#bitPointer--);
        return value;
    };
    #table=()=>{
        const length = this.#uint32();
        const target = this.#offset + length;
        const result = {
        };
        while(this.#offset < target){
            const fieldName = this.#shortstr();
            const fieldValue = this.#tableField();
            result[fieldName] = fieldValue;
        }
        return result;
    };
    #tableField=()=>{
        const type = this.#uint8();
        switch(type){
            case TableFieldType.Boolean:
                return this.#uint8() > 0;
            case TableFieldType.ShortShortUInt:
                return this.#uint8();
            case TableFieldType.ShortShortInt:
                return this.#int8();
            case TableFieldType.ShortUInt:
                return this.#uint16();
            case TableFieldType.ShortInt:
                return this.#int16();
            case TableFieldType.LongUInt:
                return this.#uint32();
            case TableFieldType.LongInt:
                return this.#int32();
            case TableFieldType.LongLongInt:
                return this.#int64();
            case TableFieldType.Float:
                return this.#float32();
            case TableFieldType.Double:
                return this.#float64();
            case TableFieldType.Decimal:
                throw new Error("Cant decode decimal");
            case TableFieldType.LongStr:
                return this.#longstr();
            case TableFieldType.FieldArray:
                return this.#tableArray();
            case TableFieldType.Timestamp:
                return this.#uint64();
            case TableFieldType.FieldTable:
                return this.#table();
            case TableFieldType.NoValue:
                return null;
            case TableFieldType.ByteArray:
                return this.#tableBytes();
            default:
                throw new Error(`Unknown table field type ${fromCharCode(type)}`);
        }
    };
    #tableArray=()=>{
        const length = this.#uint32();
        const target = this.#offset + length;
        const array = [];
        while(this.#offset < target){
            const value = this.#tableField();
            array.push(value);
        }
        return array;
    };
    #tableBytes=()=>{
        const length = this.#uint32();
        return this.#bytes(length);
    };
    #flags=()=>{
        const flags = [];
        let bits = [];
        while(!flags.length || bits[bits.length - 1]){
            const field = this.#uint16();
            bits = [];
            for(let i = 15; i >= 0; --i){
                bits.push(!!(field & 1 << i));
            }
            flags.push(...bits.slice(0, 15));
        }
        return flags;
    };
    read(type) {
        switch(type){
            case "uint8":
                return this.#uint8();
            case "uint16":
                return this.#uint16();
            case "uint32":
                return this.#uint32();
            case "uint64":
            case "timestamp":
                return this.#uint64();
            case "int8":
                return this.#int8();
            case "int16":
                return this.#int16();
            case "int32":
                return this.#int32();
            case "int64":
                return this.#int64();
            case "float32":
                return this.#float32();
            case "float64":
                return this.#float64();
            case "bit":
                return this.#bit();
            case "flags":
                return this.#flags();
            case "table":
                return this.#table();
            case "shortstr":
                return this.#shortstr();
            case "longstr":
                return this.#longstr();
            default:
                assertUnreachable(type);
        }
    }
}
const CHARCODE_A = charCode1("A");
const CHARCODE_Z = charCode1("Z");
const CHARCODE_a = charCode1("a");
const CHARCODE_z = charCode1("z");
const CHARCODE_underscore = charCode1("_");
const CHARCODE_dollar = charCode1("$");
const CHARCODE_hash = charCode1("#");
const validChars = [
    CHARCODE_dollar,
    CHARCODE_hash,
    CHARCODE_underscore
];
function isAlpha(code) {
    return code >= CHARCODE_A && code <= CHARCODE_Z || code >= CHARCODE_a && code <= CHARCODE_z;
}
function isNumeric(code) {
    return code >= 47 && code <= 58;
}
function isAllowedCharatacter(code) {
    return isAlpha(code) || isNumeric(code) || validChars.includes(code);
}
function assertValidFieldName(name) {
    if (!isAlpha(name.charCodeAt(0))) {
        throw new Error(`Invalid field name '${name}'`);
    }
    for(let i = 1; i < name.length; i++){
        if (!isAllowedCharatacter(name.charCodeAt(i))) {
            throw new Error(`Invalid field name '${name}'`);
        }
    }
}
function splitArray(arr, size4) {
    const chunks = [];
    let index = 0;
    while(index < arr.length){
        chunks.push(arr.slice(index, size4 + index));
        index += size4;
    }
    return chunks;
}
function writeBitField(bits) {
    if (bits.length > 8) {
        throw new Error(`Too many bits to fit in one byte`);
    }
    const field = (bits[7] ? 128 : 0) | (bits[6] ? 64 : 0) | (bits[5] ? 32 : 0) | (bits[4] ? 16 : 0) | (bits[3] ? 8 : 0) | (bits[2] ? 4 : 0) | (bits[1] ? 2 : 0) | (bits[0] ? 1 : 0);
    return field;
}
function outOfRange(type, value) {
    return `value '${value}' is out of range for type '${type}'`;
}
class AmqpEncoder {
    #buf;
    #view;
    #offset=0;
    #increment;
    #textEncoder=new TextEncoder();
    #pendingBits=[];
    constructor(size4 = 4096){
        this.#increment = size4;
        this.#buf = new Uint8Array(size4);
        this.#view = new DataView(this.#buf.buffer);
    }
    #forward=(size5)=>{
        const start = this.#offset;
        this.#offset = this.#offset + size5;
        if (this.#buf.length < this.#offset) {
            const buf = new Uint8Array(this.#buf.length + this.#increment);
            buf.set(this.#buf, 0);
            this.#buf = buf;
        }
        return start;
    };
    #flushBits=()=>{
        if (this.#pendingBits.length) {
            this.#bits(this.#pendingBits);
            this.#pendingBits.splice(0, this.#pendingBits.length);
        }
    };
    #uint8=(value)=>{
        if (value < 0 || value > 255) {
            throw new Error(outOfRange("uint8", value));
        }
        this.#view.setUint8(this.#forward(1), value);
    };
    #uint16=(value)=>{
        if (value < 0 || value > 65535) {
            throw new Error(outOfRange("uint16", value));
        }
        this.#view.setUint16(this.#forward(2), value);
    };
    #uint32=(value)=>{
        if (value < 0 || value > 4294967295) {
            throw new Error(outOfRange("uint32", value));
        }
        this.#view.setUint32(this.#forward(4), value);
    };
    #uint64=(value)=>{
        if (value < 0 || value > Number.MAX_SAFE_INTEGER) {
            throw new Error(outOfRange("uint32", value));
        }
        this.#view.setBigUint64(this.#forward(8), BigInt(value));
    };
    #int8=(value)=>{
        this.#view.setInt8(this.#forward(1), value);
    };
    #int16=(value)=>{
        this.#view.setInt16(this.#forward(2), value);
    };
    #int32=(value)=>{
        this.#view.setInt32(this.#forward(4), value);
    };
    #int64=(value)=>{
        this.#view.setBigInt64(this.#forward(8), BigInt(value));
    };
    #float32=(value)=>{
        this.#view.setFloat32(this.#forward(4), value);
    };
    #float64=(value)=>{
        this.#view.setFloat64(this.#forward(8), value);
    };
    #bytes=(data1)=>{
        this.#buf.set(data1, this.#forward(data1.length));
    };
    #shortString=(txt)=>{
        const data1 = this.#textEncoder.encode(txt);
        if (data1.length > 255) {
            throw new Error(`String too long for shortstring`);
        }
        this.#uint8(data1.length);
        this.#bytes(data1);
    };
    #longString=(txt)=>{
        const data1 = this.#textEncoder.encode(txt);
        this.#uint32(data1.length);
        this.#bytes(data1);
    };
    #bits=(values)=>{
        const bytes = splitArray(values, 8).map((s)=>padArray(s, 8, false)
        ).flatMap(writeBitField);
        this.#bytes(bytes);
    };
    #bit=(value)=>{
        this.#pendingBits.push(value);
    };
    #table=(table)=>{
        const start = this.#forward(4);
        for (const fieldName of Object.keys(table)){
            const value = table[fieldName];
            if (value !== undefined) {
                assertValidFieldName(fieldName);
                this.write("shortstr", fieldName);
                this.#typedField(value);
            }
        }
        this.#view.setUint32(start, this.#offset - start - 4);
    };
    #typedField=(value)=>{
        if (value instanceof Uint8Array) {
            this.#uint8(TableFieldType.ByteArray);
            this.#uint32(value.length);
            this.#bytes(value);
            return;
        }
        if (value === null) {
            this.#uint8(TableFieldType.NoValue);
            return;
        }
        if (typeof value === "number") {
            if (Math.round(value) !== value || !Number.isSafeInteger(value)) {
                this.#uint8(TableFieldType.Double);
                this.#float64(value);
                return;
            }
            if (value >= -128 && value < 128) {
                this.#uint8(TableFieldType.ShortShortInt);
                this.#int8(value);
                return;
            }
            if (value >= -32768 && value < 32768) {
                this.#uint8(TableFieldType.ShortInt);
                this.#int16(value);
                return;
            }
            if (value >= -2147483648 && value < 2147483648) {
                this.#uint8(TableFieldType.LongInt);
                this.#int32(value);
                return;
            }
            this.#uint8(TableFieldType.LongInt);
            this.#int64(value);
            return;
        }
        if (typeof value === "string") {
            this.#uint8(TableFieldType.LongStr);
            this.#longString(value);
            return;
        }
        if (Array.isArray(value)) {
            this.#uint8(TableFieldType.FieldArray);
            const s = this.#forward(4);
            for (const v of value){
                this.#typedField(v);
            }
            this.#view.setUint32(s, this.#offset - s - 4);
            return;
        }
        if (typeof value === "object") {
            this.#uint8(TableFieldType.FieldTable);
            this.#table(value);
            return;
        }
        if (typeof value === "boolean") {
            this.#uint8(TableFieldType.Boolean);
            this.#uint8(1);
            return;
        }
        throw new Error(`Don't know how to encode field of type ${typeof value} yet`);
    };
    #flags=(flags)=>{
        const chunks = splitArray(flags, 15);
        chunks.forEach((chunk, index)=>{
            const bits = [
                ...chunk,
                index < chunks.length - 1
            ];
            const field = (bits[0] ? 32768 : 0) | (bits[1] ? 16384 : 0) | (bits[2] ? 8192 : 0) | (bits[3] ? 4096 : 0) | (bits[4] ? 2048 : 0) | (bits[5] ? 1024 : 0) | (bits[6] ? 512 : 0) | (bits[7] ? 256 : 0) | (bits[8] ? 128 : 0) | (bits[9] ? 64 : 0) | (bits[10] ? 32 : 0) | (bits[11] ? 16 : 0) | (bits[12] ? 8 : 0) | (bits[13] ? 4 : 0) | (bits[14] ? 2 : 0) | (bits[15] ? 1 : 0);
            this.#uint16(field);
        });
    };
    write(type, value) {
        const field = {
            type,
            value
        };
        if (field.type !== "bit") {
            this.#flushBits();
        }
        if (value === undefined) {
            return;
        }
        switch(field.type){
            case "uint8":
                return this.#uint8(field.value);
            case "uint16":
                return this.#uint16(field.value);
            case "uint32":
                return this.#uint32(field.value);
            case "uint64":
            case "timestamp":
                return this.#uint64(field.value);
            case "int8":
                return this.#int8(field.value);
            case "int16":
                return this.#int16(field.value);
            case "int32":
                return this.#int32(field.value);
            case "int64":
                return this.#int64(field.value);
            case "float32":
                return this.#float32(field.value);
            case "float64":
                return this.#float64(field.value);
            case "bit":
                return this.#bit(field.value);
            case "flags":
                return this.#flags(field.value);
            case "table":
                return this.#table(field.value);
            case "shortstr":
                return this.#shortString(field.value);
            case "longstr":
                return this.#longString(field.value);
            default:
                assertUnreachable(field);
        }
    }
    result() {
        this.#flushBits();
        return this.#buf.slice(0, this.#offset);
    }
}
const methodNames = {
    [10]: {
        [10]: "connection.start",
        [11]: "connection.start-ok",
        [20]: "connection.secure",
        [21]: "connection.secure-ok",
        [30]: "connection.tune",
        [31]: "connection.tune-ok",
        [40]: "connection.open",
        [41]: "connection.open-ok",
        [50]: "connection.close",
        [51]: "connection.close-ok",
        [60]: "connection.blocked",
        [61]: "connection.unblocked",
        [70]: "connection.update-secret",
        [71]: "connection.update-secret-ok"
    },
    [20]: {
        [10]: "channel.open",
        [11]: "channel.open-ok",
        [20]: "channel.flow",
        [21]: "channel.flow-ok",
        [40]: "channel.close",
        [41]: "channel.close-ok"
    },
    [30]: {
        [10]: "access.request",
        [11]: "access.request-ok"
    },
    [40]: {
        [10]: "exchange.declare",
        [11]: "exchange.declare-ok",
        [20]: "exchange.delete",
        [21]: "exchange.delete-ok",
        [30]: "exchange.bind",
        [31]: "exchange.bind-ok",
        [40]: "exchange.unbind",
        [51]: "exchange.unbind-ok"
    },
    [50]: {
        [10]: "queue.declare",
        [11]: "queue.declare-ok",
        [20]: "queue.bind",
        [21]: "queue.bind-ok",
        [30]: "queue.purge",
        [31]: "queue.purge-ok",
        [40]: "queue.delete",
        [41]: "queue.delete-ok",
        [50]: "queue.unbind",
        [51]: "queue.unbind-ok"
    },
    [60]: {
        [10]: "basic.qos",
        [11]: "basic.qos-ok",
        [20]: "basic.consume",
        [21]: "basic.consume-ok",
        [30]: "basic.cancel",
        [31]: "basic.cancel-ok",
        [40]: "basic.publish",
        [50]: "basic.return",
        [60]: "basic.deliver",
        [70]: "basic.get",
        [71]: "basic.get-ok",
        [72]: "basic.get-empty",
        [80]: "basic.ack",
        [90]: "basic.reject",
        [100]: "basic.recover-async",
        [110]: "basic.recover",
        [111]: "basic.recover-ok",
        [120]: "basic.nack"
    },
    [90]: {
        [10]: "tx.select",
        [11]: "tx.select-ok",
        [20]: "tx.commit",
        [21]: "tx.commit-ok",
        [30]: "tx.rollback",
        [31]: "tx.rollback-ok"
    },
    [85]: {
        [10]: "confirm.select",
        [11]: "confirm.select-ok"
    }
};
function getMethodName(classId, methodId) {
    return methodNames[classId] && methodNames[classId][methodId];
}
function decodeMethod(data1) {
    const decoder1 = new AmqpDecoder(data1);
    const classId = decoder1.read("uint16");
    const methodId = decoder1.read("uint16");
    switch(classId){
        case 10:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                versionMajor: decoder1.read("uint8"),
                                versionMinor: decoder1.read("uint8"),
                                serverProperties: decoder1.read("table"),
                                mechanisms: decoder1.read("longstr"),
                                locales: decoder1.read("longstr")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                                clientProperties: decoder1.read("table"),
                                mechanism: decoder1.read("shortstr"),
                                response: decoder1.read("longstr"),
                                locale: decoder1.read("shortstr")
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                                challenge: decoder1.read("longstr")
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                                response: decoder1.read("longstr")
                            }
                        };
                    case 30:
                        return {
                            classId,
                            methodId,
                            args: {
                                channelMax: decoder1.read("uint16"),
                                frameMax: decoder1.read("uint32"),
                                heartbeat: decoder1.read("uint16")
                            }
                        };
                    case 31:
                        return {
                            classId,
                            methodId,
                            args: {
                                channelMax: decoder1.read("uint16"),
                                frameMax: decoder1.read("uint32"),
                                heartbeat: decoder1.read("uint16")
                            }
                        };
                    case 40:
                        return {
                            classId,
                            methodId,
                            args: {
                                virtualHost: decoder1.read("shortstr"),
                                capabilities: decoder1.read("shortstr"),
                                insist: decoder1.read("bit")
                            }
                        };
                    case 41:
                        return {
                            classId,
                            methodId,
                            args: {
                                knownHosts: decoder1.read("shortstr")
                            }
                        };
                    case 50:
                        return {
                            classId,
                            methodId,
                            args: {
                                replyCode: decoder1.read("uint16"),
                                replyText: decoder1.read("shortstr"),
                                classId: decoder1.read("uint16"),
                                methodId: decoder1.read("uint16")
                            }
                        };
                    case 51:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 60:
                        return {
                            classId,
                            methodId,
                            args: {
                                reason: decoder1.read("shortstr")
                            }
                        };
                    case 61:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 70:
                        return {
                            classId,
                            methodId,
                            args: {
                                newSecret: decoder1.read("longstr"),
                                reason: decoder1.read("shortstr")
                            }
                        };
                    case 71:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'connection'");
                }
            }
        case 20:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                outOfBand: decoder1.read("shortstr")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                                channelId: decoder1.read("longstr")
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                                active: decoder1.read("bit")
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                                active: decoder1.read("bit")
                            }
                        };
                    case 40:
                        return {
                            classId,
                            methodId,
                            args: {
                                replyCode: decoder1.read("uint16"),
                                replyText: decoder1.read("shortstr"),
                                classId: decoder1.read("uint16"),
                                methodId: decoder1.read("uint16")
                            }
                        };
                    case 41:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'channel'");
                }
            }
        case 30:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                realm: decoder1.read("shortstr"),
                                exclusive: decoder1.read("bit"),
                                passive: decoder1.read("bit"),
                                active: decoder1.read("bit"),
                                write: decoder1.read("bit"),
                                read: decoder1.read("bit")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16")
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'access'");
                }
            }
        case 40:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                exchange: decoder1.read("shortstr"),
                                type: decoder1.read("shortstr"),
                                passive: decoder1.read("bit"),
                                durable: decoder1.read("bit"),
                                autoDelete: decoder1.read("bit"),
                                internal: decoder1.read("bit"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                exchange: decoder1.read("shortstr"),
                                ifUnused: decoder1.read("bit"),
                                nowait: decoder1.read("bit")
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 30:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                destination: decoder1.read("shortstr"),
                                source: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 31:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 40:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                destination: decoder1.read("shortstr"),
                                source: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 51:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'exchange'");
                }
            }
        case 50:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                passive: decoder1.read("bit"),
                                durable: decoder1.read("bit"),
                                exclusive: decoder1.read("bit"),
                                autoDelete: decoder1.read("bit"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                                queue: decoder1.read("shortstr"),
                                messageCount: decoder1.read("uint32"),
                                consumerCount: decoder1.read("uint32")
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 30:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                nowait: decoder1.read("bit")
                            }
                        };
                    case 31:
                        return {
                            classId,
                            methodId,
                            args: {
                                messageCount: decoder1.read("uint32")
                            }
                        };
                    case 40:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                ifUnused: decoder1.read("bit"),
                                ifEmpty: decoder1.read("bit"),
                                nowait: decoder1.read("bit")
                            }
                        };
                    case 41:
                        return {
                            classId,
                            methodId,
                            args: {
                                messageCount: decoder1.read("uint32")
                            }
                        };
                    case 50:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 51:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'queue'");
                }
            }
        case 60:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                prefetchSize: decoder1.read("uint32"),
                                prefetchCount: decoder1.read("uint16"),
                                global: decoder1.read("bit")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                consumerTag: decoder1.read("shortstr"),
                                noLocal: decoder1.read("bit"),
                                noAck: decoder1.read("bit"),
                                exclusive: decoder1.read("bit"),
                                nowait: decoder1.read("bit"),
                                arguments: decoder1.read("table")
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                                consumerTag: decoder1.read("shortstr")
                            }
                        };
                    case 30:
                        return {
                            classId,
                            methodId,
                            args: {
                                consumerTag: decoder1.read("shortstr"),
                                nowait: decoder1.read("bit")
                            }
                        };
                    case 31:
                        return {
                            classId,
                            methodId,
                            args: {
                                consumerTag: decoder1.read("shortstr")
                            }
                        };
                    case 40:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                mandatory: decoder1.read("bit"),
                                immediate: decoder1.read("bit")
                            }
                        };
                    case 50:
                        return {
                            classId,
                            methodId,
                            args: {
                                replyCode: decoder1.read("uint16"),
                                replyText: decoder1.read("shortstr"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr")
                            }
                        };
                    case 60:
                        return {
                            classId,
                            methodId,
                            args: {
                                consumerTag: decoder1.read("shortstr"),
                                deliveryTag: decoder1.read("uint64"),
                                redelivered: decoder1.read("bit"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr")
                            }
                        };
                    case 70:
                        return {
                            classId,
                            methodId,
                            args: {
                                ticket: decoder1.read("uint16"),
                                queue: decoder1.read("shortstr"),
                                noAck: decoder1.read("bit")
                            }
                        };
                    case 71:
                        return {
                            classId,
                            methodId,
                            args: {
                                deliveryTag: decoder1.read("uint64"),
                                redelivered: decoder1.read("bit"),
                                exchange: decoder1.read("shortstr"),
                                routingKey: decoder1.read("shortstr"),
                                messageCount: decoder1.read("uint32")
                            }
                        };
                    case 72:
                        return {
                            classId,
                            methodId,
                            args: {
                                clusterId: decoder1.read("shortstr")
                            }
                        };
                    case 80:
                        return {
                            classId,
                            methodId,
                            args: {
                                deliveryTag: decoder1.read("uint64"),
                                multiple: decoder1.read("bit")
                            }
                        };
                    case 90:
                        return {
                            classId,
                            methodId,
                            args: {
                                deliveryTag: decoder1.read("uint64"),
                                requeue: decoder1.read("bit")
                            }
                        };
                    case 100:
                        return {
                            classId,
                            methodId,
                            args: {
                                requeue: decoder1.read("bit")
                            }
                        };
                    case 110:
                        return {
                            classId,
                            methodId,
                            args: {
                                requeue: decoder1.read("bit")
                            }
                        };
                    case 111:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 120:
                        return {
                            classId,
                            methodId,
                            args: {
                                deliveryTag: decoder1.read("uint64"),
                                multiple: decoder1.read("bit"),
                                requeue: decoder1.read("bit")
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'basic'");
                }
            }
        case 90:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 20:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 21:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 30:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    case 31:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'tx'");
                }
            }
        case 85:
            {
                switch(methodId){
                    case 10:
                        return {
                            classId,
                            methodId,
                            args: {
                                nowait: decoder1.read("bit")
                            }
                        };
                    case 11:
                        return {
                            classId,
                            methodId,
                            args: {
                            }
                        };
                    default:
                        throw new Error("Unknown method " + methodId + " for class 'confirm'");
                }
            }
        default:
            throw new Error("Unknown class " + classId);
    }
}
function encodeMethod(method) {
    const encoder1 = new AmqpEncoder();
    encoder1.write("uint16", method.classId);
    encoder1.write("uint16", method.methodId);
    switch(method.classId){
        case 10:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("uint8", method.args.versionMajor !== undefined ? method.args.versionMajor : 0);
                        encoder1.write("uint8", method.args.versionMinor !== undefined ? method.args.versionMinor : 9);
                        encoder1.write("table", method.args.serverProperties);
                        encoder1.write("longstr", method.args.mechanisms !== undefined ? method.args.mechanisms : "PLAIN");
                        encoder1.write("longstr", method.args.locales !== undefined ? method.args.locales : "en_US");
                        break;
                    case 11:
                        encoder1.write("table", method.args.clientProperties);
                        encoder1.write("shortstr", method.args.mechanism !== undefined ? method.args.mechanism : "PLAIN");
                        encoder1.write("longstr", method.args.response);
                        encoder1.write("shortstr", method.args.locale !== undefined ? method.args.locale : "en_US");
                        break;
                    case 20:
                        encoder1.write("longstr", method.args.challenge);
                        break;
                    case 21:
                        encoder1.write("longstr", method.args.response);
                        break;
                    case 30:
                        encoder1.write("uint16", method.args.channelMax !== undefined ? method.args.channelMax : 0);
                        encoder1.write("uint32", method.args.frameMax !== undefined ? method.args.frameMax : 0);
                        encoder1.write("uint16", method.args.heartbeat !== undefined ? method.args.heartbeat : 0);
                        break;
                    case 31:
                        encoder1.write("uint16", method.args.channelMax !== undefined ? method.args.channelMax : 0);
                        encoder1.write("uint32", method.args.frameMax !== undefined ? method.args.frameMax : 0);
                        encoder1.write("uint16", method.args.heartbeat !== undefined ? method.args.heartbeat : 0);
                        break;
                    case 40:
                        encoder1.write("shortstr", method.args.virtualHost !== undefined ? method.args.virtualHost : "/");
                        encoder1.write("shortstr", method.args.capabilities !== undefined ? method.args.capabilities : "");
                        encoder1.write("bit", method.args.insist !== undefined ? method.args.insist : false);
                        break;
                    case 41:
                        encoder1.write("shortstr", method.args.knownHosts !== undefined ? method.args.knownHosts : "");
                        break;
                    case 50:
                        encoder1.write("uint16", method.args.replyCode);
                        encoder1.write("shortstr", method.args.replyText !== undefined ? method.args.replyText : "");
                        encoder1.write("uint16", method.args.classId);
                        encoder1.write("uint16", method.args.methodId);
                        break;
                    case 51: break;
                    case 60:
                        encoder1.write("shortstr", method.args.reason !== undefined ? method.args.reason : "");
                        break;
                    case 61: break;
                    case 70:
                        encoder1.write("longstr", method.args.newSecret);
                        encoder1.write("shortstr", method.args.reason);
                        break;
                    case 71: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'connection'");
                }
                break;
            }
        case 20:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("shortstr", method.args.outOfBand !== undefined ? method.args.outOfBand : "");
                        break;
                    case 11:
                        encoder1.write("longstr", method.args.channelId !== undefined ? method.args.channelId : "");
                        break;
                    case 20:
                        encoder1.write("bit", method.args.active);
                        break;
                    case 21:
                        encoder1.write("bit", method.args.active);
                        break;
                    case 40:
                        encoder1.write("uint16", method.args.replyCode);
                        encoder1.write("shortstr", method.args.replyText !== undefined ? method.args.replyText : "");
                        encoder1.write("uint16", method.args.classId);
                        encoder1.write("uint16", method.args.methodId);
                        break;
                    case 41: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'channel'");
                }
                break;
            }
        case 30:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("shortstr", method.args.realm !== undefined ? method.args.realm : "/data");
                        encoder1.write("bit", method.args.exclusive !== undefined ? method.args.exclusive : false);
                        encoder1.write("bit", method.args.passive !== undefined ? method.args.passive : true);
                        encoder1.write("bit", method.args.active !== undefined ? method.args.active : true);
                        encoder1.write("bit", method.args.write !== undefined ? method.args.write : true);
                        encoder1.write("bit", method.args.read !== undefined ? method.args.read : true);
                        break;
                    case 11:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 1);
                        break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'access'");
                }
                break;
            }
        case 40:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.type !== undefined ? method.args.type : "direct");
                        encoder1.write("bit", method.args.passive !== undefined ? method.args.passive : false);
                        encoder1.write("bit", method.args.durable !== undefined ? method.args.durable : false);
                        encoder1.write("bit", method.args.autoDelete !== undefined ? method.args.autoDelete : false);
                        encoder1.write("bit", method.args.internal !== undefined ? method.args.internal : false);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 11: break;
                    case 20:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("bit", method.args.ifUnused !== undefined ? method.args.ifUnused : false);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        break;
                    case 21: break;
                    case 30:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.destination);
                        encoder1.write("shortstr", method.args.source);
                        encoder1.write("shortstr", method.args.routingKey !== undefined ? method.args.routingKey : "");
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 31: break;
                    case 40:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.destination);
                        encoder1.write("shortstr", method.args.source);
                        encoder1.write("shortstr", method.args.routingKey !== undefined ? method.args.routingKey : "");
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 51: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'exchange'");
                }
                break;
            }
        case 50:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("bit", method.args.passive !== undefined ? method.args.passive : false);
                        encoder1.write("bit", method.args.durable !== undefined ? method.args.durable : false);
                        encoder1.write("bit", method.args.exclusive !== undefined ? method.args.exclusive : false);
                        encoder1.write("bit", method.args.autoDelete !== undefined ? method.args.autoDelete : false);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 11:
                        encoder1.write("shortstr", method.args.queue);
                        encoder1.write("uint32", method.args.messageCount);
                        encoder1.write("uint32", method.args.consumerCount);
                        break;
                    case 20:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.routingKey !== undefined ? method.args.routingKey : "");
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 21: break;
                    case 30:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        break;
                    case 31:
                        encoder1.write("uint32", method.args.messageCount);
                        break;
                    case 40:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("bit", method.args.ifUnused !== undefined ? method.args.ifUnused : false);
                        encoder1.write("bit", method.args.ifEmpty !== undefined ? method.args.ifEmpty : false);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        break;
                    case 41:
                        encoder1.write("uint32", method.args.messageCount);
                        break;
                    case 50:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.routingKey !== undefined ? method.args.routingKey : "");
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 51: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'queue'");
                }
                break;
            }
        case 60:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("uint32", method.args.prefetchSize !== undefined ? method.args.prefetchSize : 0);
                        encoder1.write("uint16", method.args.prefetchCount !== undefined ? method.args.prefetchCount : 0);
                        encoder1.write("bit", method.args.global !== undefined ? method.args.global : false);
                        break;
                    case 11: break;
                    case 20:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("shortstr", method.args.consumerTag !== undefined ? method.args.consumerTag : "");
                        encoder1.write("bit", method.args.noLocal !== undefined ? method.args.noLocal : false);
                        encoder1.write("bit", method.args.noAck !== undefined ? method.args.noAck : false);
                        encoder1.write("bit", method.args.exclusive !== undefined ? method.args.exclusive : false);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        encoder1.write("table", method.args.arguments !== undefined ? method.args.arguments : {
                        });
                        break;
                    case 21:
                        encoder1.write("shortstr", method.args.consumerTag);
                        break;
                    case 30:
                        encoder1.write("shortstr", method.args.consumerTag);
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        break;
                    case 31:
                        encoder1.write("shortstr", method.args.consumerTag);
                        break;
                    case 40:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.exchange !== undefined ? method.args.exchange : "");
                        encoder1.write("shortstr", method.args.routingKey !== undefined ? method.args.routingKey : "");
                        encoder1.write("bit", method.args.mandatory !== undefined ? method.args.mandatory : false);
                        encoder1.write("bit", method.args.immediate !== undefined ? method.args.immediate : false);
                        break;
                    case 50:
                        encoder1.write("uint16", method.args.replyCode);
                        encoder1.write("shortstr", method.args.replyText !== undefined ? method.args.replyText : "");
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.routingKey);
                        break;
                    case 60:
                        encoder1.write("shortstr", method.args.consumerTag);
                        encoder1.write("uint64", method.args.deliveryTag);
                        encoder1.write("bit", method.args.redelivered !== undefined ? method.args.redelivered : false);
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.routingKey);
                        break;
                    case 70:
                        encoder1.write("uint16", method.args.ticket !== undefined ? method.args.ticket : 0);
                        encoder1.write("shortstr", method.args.queue !== undefined ? method.args.queue : "");
                        encoder1.write("bit", method.args.noAck !== undefined ? method.args.noAck : false);
                        break;
                    case 71:
                        encoder1.write("uint64", method.args.deliveryTag);
                        encoder1.write("bit", method.args.redelivered !== undefined ? method.args.redelivered : false);
                        encoder1.write("shortstr", method.args.exchange);
                        encoder1.write("shortstr", method.args.routingKey);
                        encoder1.write("uint32", method.args.messageCount);
                        break;
                    case 72:
                        encoder1.write("shortstr", method.args.clusterId !== undefined ? method.args.clusterId : "");
                        break;
                    case 80:
                        encoder1.write("uint64", method.args.deliveryTag !== undefined ? method.args.deliveryTag : 0);
                        encoder1.write("bit", method.args.multiple !== undefined ? method.args.multiple : false);
                        break;
                    case 90:
                        encoder1.write("uint64", method.args.deliveryTag);
                        encoder1.write("bit", method.args.requeue !== undefined ? method.args.requeue : true);
                        break;
                    case 100:
                        encoder1.write("bit", method.args.requeue !== undefined ? method.args.requeue : false);
                        break;
                    case 110:
                        encoder1.write("bit", method.args.requeue !== undefined ? method.args.requeue : false);
                        break;
                    case 111: break;
                    case 120:
                        encoder1.write("uint64", method.args.deliveryTag !== undefined ? method.args.deliveryTag : 0);
                        encoder1.write("bit", method.args.multiple !== undefined ? method.args.multiple : false);
                        encoder1.write("bit", method.args.requeue !== undefined ? method.args.requeue : true);
                        break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'basic'");
                }
                break;
            }
        case 90:
            {
                switch(method.methodId){
                    case 10: break;
                    case 11: break;
                    case 20: break;
                    case 21: break;
                    case 30: break;
                    case 31: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'tx'");
                }
                break;
            }
        case 85:
            {
                switch(method.methodId){
                    case 10:
                        encoder1.write("bit", method.args.nowait !== undefined ? method.args.nowait : false);
                        break;
                    case 11: break;
                    default:
                        throw new Error("Unknown method " + method.methodId + " for class 'confirm'");
                }
                break;
            }
        default:
            throw new Error("Unknown class " + method.classId);
    }
    return encoder1.result();
}
function decodeHeader(data1) {
    const decoder1 = new AmqpDecoder(data1);
    const classId = decoder1.read("uint16");
    decoder1.read("uint16");
    const size5 = decoder1.read("uint64");
    const flags = decoder1.read("flags");
    switch(classId){
        case 10:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 20:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 30:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 40:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 50:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 60:
            return {
                classId,
                size: size5,
                props: {
                    contentType: flags[0] ? decoder1.read("shortstr") : undefined,
                    contentEncoding: flags[1] ? decoder1.read("shortstr") : undefined,
                    headers: flags[2] ? decoder1.read("table") : undefined,
                    deliveryMode: flags[3] ? decoder1.read("uint8") : undefined,
                    priority: flags[4] ? decoder1.read("uint8") : undefined,
                    correlationId: flags[5] ? decoder1.read("shortstr") : undefined,
                    replyTo: flags[6] ? decoder1.read("shortstr") : undefined,
                    expiration: flags[7] ? decoder1.read("shortstr") : undefined,
                    messageId: flags[8] ? decoder1.read("shortstr") : undefined,
                    timestamp: flags[9] ? decoder1.read("uint64") : undefined,
                    type: flags[10] ? decoder1.read("shortstr") : undefined,
                    userId: flags[11] ? decoder1.read("shortstr") : undefined,
                    appId: flags[12] ? decoder1.read("shortstr") : undefined,
                    clusterId: flags[13] ? decoder1.read("shortstr") : undefined
                }
            };
        case 90:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        case 85:
            return {
                classId,
                size: size5,
                props: {
                }
            };
        default:
            throw new Error("Unknown class " + classId);
    }
}
function encodeHeader(header) {
    const encoder1 = new AmqpEncoder();
    encoder1.write("uint16", header.classId);
    encoder1.write("uint16", 0);
    encoder1.write("uint64", header.size);
    switch(header.classId){
        case 10:
            encoder1.write("flags", []);
            break;
        case 20:
            encoder1.write("flags", []);
            break;
        case 30:
            encoder1.write("flags", []);
            break;
        case 40:
            encoder1.write("flags", []);
            break;
        case 50:
            encoder1.write("flags", []);
            break;
        case 60:
            encoder1.write("flags", [
                header.props.contentType !== undefined,
                header.props.contentEncoding !== undefined,
                header.props.headers !== undefined,
                header.props.deliveryMode !== undefined,
                header.props.priority !== undefined,
                header.props.correlationId !== undefined,
                header.props.replyTo !== undefined,
                header.props.expiration !== undefined,
                header.props.messageId !== undefined,
                header.props.timestamp !== undefined,
                header.props.type !== undefined,
                header.props.userId !== undefined,
                header.props.appId !== undefined,
                header.props.clusterId !== undefined, 
            ]);
            if (header.props.contentType !== undefined) {
                encoder1.write("shortstr", header.props.contentType);
            }
            if (header.props.contentEncoding !== undefined) {
                encoder1.write("shortstr", header.props.contentEncoding);
            }
            if (header.props.headers !== undefined) {
                encoder1.write("table", header.props.headers);
            }
            if (header.props.deliveryMode !== undefined) {
                encoder1.write("uint8", header.props.deliveryMode);
            }
            if (header.props.priority !== undefined) {
                encoder1.write("uint8", header.props.priority);
            }
            if (header.props.correlationId !== undefined) {
                encoder1.write("shortstr", header.props.correlationId);
            }
            if (header.props.replyTo !== undefined) {
                encoder1.write("shortstr", header.props.replyTo);
            }
            if (header.props.expiration !== undefined) {
                encoder1.write("shortstr", header.props.expiration);
            }
            if (header.props.messageId !== undefined) {
                encoder1.write("shortstr", header.props.messageId);
            }
            if (header.props.timestamp !== undefined) {
                encoder1.write("uint64", header.props.timestamp);
            }
            if (header.props.type !== undefined) {
                encoder1.write("shortstr", header.props.type);
            }
            if (header.props.userId !== undefined) {
                encoder1.write("shortstr", header.props.userId);
            }
            if (header.props.appId !== undefined) {
                encoder1.write("shortstr", header.props.appId);
            }
            if (header.props.clusterId !== undefined) {
                encoder1.write("shortstr", header.props.clusterId);
            }
            break;
        case 90:
            encoder1.write("flags", []);
            break;
        case 85:
            encoder1.write("flags", []);
            break;
        default:
            throw new Error("Unknown class " + header.classId);
    }
    return encoder1.result();
}
function copy1(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError1 extends Error {
    constructor(message1){
        super(message1);
        this.name = "DenoStdInternalError";
    }
}
function assert1(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError1(msg);
    }
}
const DEFAULT_BUF_SIZE1 = 4096;
const MIN_BUF_SIZE1 = 16;
const CR1 = "\r".charCodeAt(0);
const LF1 = "\n".charCodeAt(0);
class BufferFullError1 extends Error {
    name = "BufferFullError";
    constructor(partial1){
        super("Buffer full");
        this.partial = partial1;
    }
}
class PartialReadError1 extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader1 {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader1 ? r : new BufReader1(r, size);
    }
    constructor(rd2, size5 = 4096){
        if (size5 < 16) {
            size5 = MIN_BUF_SIZE1;
        }
        this._reset(new Uint8Array(size5), rd2);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert1(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr1 = await this.rd.read(p);
                const nread = rr1 ?? 0;
                assert1(nread >= 0, "negative read");
                return rr1;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert1(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy1(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError1();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF1);
        } catch (err) {
            let { partial: partial2  } = err;
            assert1(partial2 instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError1)) {
                throw err;
            }
            if (!this.eof && partial2.byteLength > 0 && partial2[partial2.byteLength - 1] === CR1) {
                assert1(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial2 = partial2.subarray(0, partial2.byteLength - 1);
            }
            return {
                line: partial2,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF1) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR1) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError1(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError1(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase1 {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter1 extends AbstractBufBase1 {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter1 ? writer : new BufWriter1(writer, size);
    }
    constructor(writer3, size6 = 4096){
        super();
        this.writer = writer3;
        if (size6 <= 0) {
            size6 = DEFAULT_BUF_SIZE1;
        }
        this.buf = new Uint8Array(size6);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync1 extends AbstractBufBase1 {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync1 ? writer : new BufWriterSync1(writer, size);
    }
    constructor(writer4, size7 = 4096){
        super();
        this.writer = writer4;
        if (size7 <= 0) {
            size7 = DEFAULT_BUF_SIZE1;
        }
        this.buf = new Uint8Array(size7);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy1(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
function format(code, msg) {
    if (!msg) {
        return code;
    }
    return `${code} - ${msg}`;
}
class FrameError extends Error {
    constructor(code, msg){
        super(format(code, msg));
        this.code = code;
    }
}
class AmqpFrameReader {
    #timer=null;
    #reader;
    constructor(r){
        this.#reader = BufReader1.create(r);
    }
    #readBytes=async (length)=>{
        const n = await this.#reader.readFull(new Uint8Array(length));
        if (n === null) {
            throw new FrameError("EOF");
        }
        return n;
    };
    #readFrame=async ()=>{
        const prefix = await this.#readBytes(7);
        const prefixView = new DataView(prefix.buffer);
        const type = prefixView.getUint8(0);
        const channel = prefixView.getUint16(1);
        const length = prefixView.getUint32(3);
        const rest = await this.#readBytes(length + 1);
        const endByte = rest[rest.length - 1];
        if (endByte !== 206) {
            throw new FrameError("BAD_FRAME", `unexpected FRAME_END '${endByte}'`);
        }
        const payload = rest.slice(0, rest.length - 1);
        if (type === 1) {
            return {
                type: "method",
                channel: channel,
                payload: decodeMethod(payload)
            };
        }
        if (type === 2) {
            return {
                type: "header",
                channel,
                payload: decodeHeader(payload)
            };
        }
        if (type === 3) {
            return {
                type: "content",
                channel,
                payload
            };
        }
        if (type === 8) {
            return {
                type: "heartbeat",
                channel,
                payload
            };
        }
        throw new FrameError("BAD_FRAME", `unexpected frame type '${type}'`);
    };
    async abort() {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
        }
    }
    read(timeout) {
        this.abort();
        if (timeout <= 0) {
            return this.#readFrame();
        }
        const timeoutMessage = `server heartbeat timeout ${timeout}ms`;
        return new Promise(async (resolve, reject)=>{
            this.#timer = setTimeout(()=>{
                reject(new Error(timeoutMessage));
            }, timeout);
            this.#readFrame().then(resolve).catch(reject).finally(()=>this.abort()
            );
        });
    }
}
const TYPES = {
    method: 1,
    header: 2,
    content: 3,
    heartbeat: 8
};
function encodeFrame(frame) {
    let payload;
    switch(frame.type){
        case "method":
            payload = encodeMethod(frame.payload);
            break;
        case "header":
            payload = encodeHeader(frame.payload);
            break;
        default:
            payload = frame.payload;
            break;
    }
    const data2 = new Uint8Array(7 + payload.length + 1);
    const view = new DataView(data2.buffer);
    const type = TYPES[frame.type];
    view.setUint8(0, type);
    view.setUint16(1, frame.channel);
    view.setUint32(3, payload.length);
    data2.set(payload, 7);
    view.setUint8(7 + payload.length, 206);
    return data2;
}
const HEARTBEAT_FRAME = new Uint8Array([
    8,
    0,
    0,
    0,
    0,
    0,
    0,
    206, 
]);
function splitArray1(arr, size8) {
    const chunks = [];
    let index = 0;
    while(index < arr.length){
        chunks.push(arr.slice(index, size8 + index));
        index += size8;
    }
    return chunks;
}
class AmqpSocket {
    #conn;
    #reader;
    #sendTimer=null;
    #sendTimeout=0;
    #readTimeout=0;
    #frameMax=-1;
    constructor(conn){
        this.#conn = conn;
        this.#reader = new AmqpFrameReader(conn);
    }
    #resetSendTimer=()=>{
        if (this.#sendTimer !== null) {
            clearTimeout(this.#sendTimer);
            this.#sendTimer = null;
        }
        if (this.#sendTimeout > 0) {
            this.#sendTimer = setTimeout(()=>{
                this.#conn.write(HEARTBEAT_FRAME);
                this.#resetSendTimer();
            }, this.#sendTimeout);
        }
    };
    tune(options) {
        this.#readTimeout = options.readTimeout !== undefined ? options.readTimeout : this.#readTimeout;
        this.#sendTimeout = options.sendTimeout !== undefined ? options.sendTimeout : this.#sendTimeout;
        this.#frameMax = options.frameMax !== undefined ? options.frameMax : this.#frameMax;
        this.#resetSendTimer();
    }
    async start() {
        await this.#conn.write(new Uint8Array([
            ...new TextEncoder().encode("AMQP"),
            0,
            0,
            9,
            1
        ]));
    }
    async write(frame) {
        this.#resetSendTimer();
        if (frame.type === "content" && this.#frameMax > 8 && frame.payload.length > this.#frameMax - 8) {
            await Promise.all(splitArray1(frame.payload, this.#frameMax - 8).map((chunk)=>{
                this.#conn.write(encodeFrame({
                    type: "content",
                    channel: frame.channel,
                    payload: chunk
                }));
            }));
            return;
        }
        await this.#conn.write(encodeFrame(frame));
    }
    #clear=()=>{
        this.#readTimeout = 0;
        this.#sendTimeout = 0;
        this.#reader.abort();
        this.#resetSendTimer();
    };
    async read() {
        try {
            return await this.#reader.read(this.#readTimeout);
        } catch (error) {
            this.close();
            throw error;
        }
    }
    close() {
        this.#clear();
        this.#conn.close();
    }
}
function createResolvable() {
    let resolveFun;
    let rejectFun;
    const promise = new Promise((resolve, reject)=>{
        resolveFun = resolve;
        rejectFun = reject;
    });
    promise.catch(()=>{
    });
    return {
        then: promise.then.bind(promise),
        resolve (value) {
            resolveFun(value);
            return promise;
        },
        reject (reason) {
            rejectFun(reason);
        }
    };
}
function serializeChannelError(channel, args) {
    const causedBy = getMethodName(args.classId, args.methodId);
    return `Channel ${channel} closed by server - ${args.replyCode} ${args.replyText || ""}${causedBy ? ` - caused by '${causedBy}'` : ""}`;
}
function serializeConnectionError(args) {
    const causedBy = getMethodName(args.classId, args.methodId);
    return `Connection closed by server - ${args.replyCode} ${args.replyText || ""}${causedBy ? ` - caused by '${causedBy}'` : ""}`;
}
class AmqpChannel {
    #cancelDeliverSubscription;
    #cancelReturnSubscription;
    #subscribers=[];
    #channelNumber;
    #protocol;
    #closedPromise=createResolvable();
    #isOpen=true;
    constructor(channelNumber, protocol){
        this.#protocol = protocol;
        this.#channelNumber = channelNumber;
        this.#cancelDeliverSubscription = protocol.subscribeBasicDeliver(channelNumber, this.#handleDeliver);
        this.#cancelReturnSubscription = protocol.subscribeBasicReturn(channelNumber, this.#handleReturn);
        protocol.receiveChannelClose(channelNumber).then(this.#handleClose).catch(this.#handleCloseError).finally(()=>{
            this.#isOpen = false;
        });
        protocol.receiveConnectionClose(0).then(this.#handleConnectionClose).catch(this.#handleCloseError).finally(()=>{
            this.#isOpen = false;
        });
    }
    #handleCloseError=async (error)=>{
        this.#cleanup();
        this.#closedPromise.reject(error);
    };
    #handleClose=async (args)=>{
        if (this.#isOpen) {
            await this.#protocol.sendChannelCloseOk(this.#channelNumber, {
            });
            this.#cleanup();
            this.#closedPromise.reject(new Error(serializeChannelError(this.#channelNumber, args)));
        }
    };
    #handleConnectionClose=async (args)=>{
        if (this.#isOpen) {
            this.#cleanup();
            this.#closedPromise.reject(new Error(serializeConnectionError(args)));
        }
    };
    #handleDeliver=(args, props, data2)=>{
        this.#subscribers.forEach((subscriber)=>{
            if (subscriber.type === "deliver" && subscriber.tag === args.consumerTag) {
                subscriber.handler(args, props, data2);
            }
        });
    };
    #handleReturn=(args, props, data2)=>{
        this.#subscribers.forEach((subscriber)=>{
            if (subscriber.type === "return") {
                subscriber.handler(args, props, data2);
            }
        });
    };
    #cleanup=()=>{
        this.#cancelDeliverSubscription();
        this.#cancelReturnSubscription();
        this.#subscribers.splice(0, this.#subscribers.length);
    };
    async closed() {
        return await this.#closedPromise;
    }
    async close() {
        await this.#protocol.sendChannelClose(this.#channelNumber, {
            classId: 0,
            methodId: 0,
            replyCode: 320,
            replyText: "Channel closed by client"
        });
        this.#cleanup();
        this.#closedPromise.resolve();
        this.#isOpen = false;
    }
    async qos(args) {
        return this.#protocol.sendBasicQos(this.#channelNumber, args);
    }
    async ack(args) {
        await this.#protocol.sendBasicAck(this.#channelNumber, args);
    }
    async nack(args) {
        await this.#protocol.sendBasicNack(this.#channelNumber, args);
    }
    async consume(args, handler) {
        const response = await this.#protocol.sendBasicConsume(this.#channelNumber, args);
        this.#subscribers.push({
            type: "deliver",
            tag: response.consumerTag,
            handler
        });
        return response;
    }
    async cancel(args) {
        const response = await this.#protocol.sendBasicCancel(this.#channelNumber, args);
        const index = this.#subscribers.findIndex((sub)=>sub.type === "deliver" && sub.tag === args.consumerTag
        );
        if (index !== -1) {
            this.#subscribers.splice(index, index + 1);
        }
        return response;
    }
    async publish(args, props, data) {
        await this.#protocol.sendBasicPublish(this.#channelNumber, args, props, data);
    }
    async declareQueue(args) {
        return this.#protocol.sendQueueDeclare(this.#channelNumber, args);
    }
    async deleteQueue(args) {
        return this.#protocol.sendQueueDelete(this.#channelNumber, args);
    }
    async bindQueue(args) {
        return this.#protocol.sendQueueBind(this.#channelNumber, args);
    }
    async unbindQueue(args) {
        return this.#protocol.sendQueueUnbind(this.#channelNumber, args);
    }
    async purgeQueue(args) {
        return this.#protocol.sendQueuePurge(this.#channelNumber, args);
    }
    async deleteExchange(args) {
        return this.#protocol.sendExchangeDelete(this.#channelNumber, args);
    }
    async declareExchange(args) {
        return this.#protocol.sendExchangeDeclare(this.#channelNumber, args);
    }
    async bindExchange(args) {
        return this.#protocol.sendExchangeBind(this.#channelNumber, args);
    }
    async unbindExchange(args) {
        return this.#protocol.sendExchangeUnbind(this.#channelNumber, args);
    }
    on(event, handler) {
        switch(event){
            case "return":
                this.#subscribers.push({
                    type: "return",
                    handler: handler
                });
                break;
            case "deliver":
                this.#subscribers.push({
                    type: "deliver",
                    handler: handler
                });
                break;
            default:
                throw new Error(`Unknown event '${event}'`);
        }
    }
    off(event, handler) {
        const index = this.#subscribers.findIndex((sub)=>sub.type === event && sub.handler === handler
        );
        if (index !== -1) {
            this.#subscribers.splice(index, index + 1);
        }
    }
}
class AmqpProtocol {
    constructor(mux){
        this.mux = mux;
    }
    async sendConnectionStartOk(channel, args) {
        await this.mux.send(channel, 10, 11, args);
    }
    async sendConnectionSecureOk(channel, args) {
        await this.mux.send(channel, 10, 21, args);
    }
    async sendConnectionTuneOk(channel, args) {
        await this.mux.send(channel, 10, 31, args);
    }
    async sendConnectionOpen(channel, args) {
        await this.mux.send(channel, 10, 40, args);
        return this.mux.receive(channel, 10, 41);
    }
    async sendConnectionClose(channel, args) {
        await this.mux.send(channel, 10, 50, args);
        return this.mux.receive(channel, 10, 51);
    }
    async sendConnectionCloseOk(channel, args) {
        await this.mux.send(channel, 10, 51, args);
    }
    async sendChannelOpen(channel, args) {
        await this.mux.send(channel, 20, 10, args);
        return this.mux.receive(channel, 20, 11);
    }
    async sendChannelFlow(channel, args) {
        await this.mux.send(channel, 20, 20, args);
        return this.mux.receive(channel, 20, 21);
    }
    async sendChannelClose(channel, args) {
        await this.mux.send(channel, 20, 40, args);
        return this.mux.receive(channel, 20, 41);
    }
    async sendChannelCloseOk(channel, args) {
        await this.mux.send(channel, 20, 41, args);
    }
    async sendExchangeDeclareAsync(channel, args) {
        await this.mux.send(channel, 40, 10, {
            ...args,
            nowait: true
        });
    }
    async sendExchangeDeclare(channel, args) {
        await this.mux.send(channel, 40, 10, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 40, 11);
    }
    async sendExchangeDeclareOk(channel, args) {
        await this.mux.send(channel, 40, 11, args);
    }
    async sendExchangeDeleteAsync(channel, args) {
        await this.mux.send(channel, 40, 20, {
            ...args,
            nowait: true
        });
    }
    async sendExchangeDelete(channel, args) {
        await this.mux.send(channel, 40, 20, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 40, 21);
    }
    async sendExchangeDeleteOk(channel, args) {
        await this.mux.send(channel, 40, 21, args);
    }
    async sendExchangeBindAsync(channel, args) {
        await this.mux.send(channel, 40, 30, {
            ...args,
            nowait: true
        });
    }
    async sendExchangeBind(channel, args) {
        await this.mux.send(channel, 40, 30, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 40, 31);
    }
    async sendExchangeBindOk(channel, args) {
        await this.mux.send(channel, 40, 31, args);
    }
    async sendExchangeUnbindAsync(channel, args) {
        await this.mux.send(channel, 40, 40, {
            ...args,
            nowait: true
        });
    }
    async sendExchangeUnbind(channel, args) {
        await this.mux.send(channel, 40, 40, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 40, 51);
    }
    async sendExchangeUnbindOk(channel, args) {
        await this.mux.send(channel, 40, 51, args);
    }
    async sendQueueDeclareAsync(channel, args) {
        await this.mux.send(channel, 50, 10, {
            ...args,
            nowait: true
        });
    }
    async sendQueueDeclare(channel, args) {
        await this.mux.send(channel, 50, 10, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 50, 11);
    }
    async sendQueueDeclareOk(channel, args) {
        await this.mux.send(channel, 50, 11, args);
    }
    async sendQueueBindAsync(channel, args) {
        await this.mux.send(channel, 50, 20, {
            ...args,
            nowait: true
        });
    }
    async sendQueueBind(channel, args) {
        await this.mux.send(channel, 50, 20, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 50, 21);
    }
    async sendQueueBindOk(channel, args) {
        await this.mux.send(channel, 50, 21, args);
    }
    async sendQueuePurgeAsync(channel, args) {
        await this.mux.send(channel, 50, 30, {
            ...args,
            nowait: true
        });
    }
    async sendQueuePurge(channel, args) {
        await this.mux.send(channel, 50, 30, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 50, 31);
    }
    async sendQueuePurgeOk(channel, args) {
        await this.mux.send(channel, 50, 31, args);
    }
    async sendQueueDeleteAsync(channel, args) {
        await this.mux.send(channel, 50, 40, {
            ...args,
            nowait: true
        });
    }
    async sendQueueDelete(channel, args) {
        await this.mux.send(channel, 50, 40, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 50, 41);
    }
    async sendQueueDeleteOk(channel, args) {
        await this.mux.send(channel, 50, 41, args);
    }
    async sendQueueUnbind(channel, args) {
        await this.mux.send(channel, 50, 50, args);
        return this.mux.receive(channel, 50, 51);
    }
    async sendQueueUnbindOk(channel, args) {
        await this.mux.send(channel, 50, 51, args);
    }
    async sendBasicQos(channel, args) {
        await this.mux.send(channel, 60, 10, args);
        return this.mux.receive(channel, 60, 11);
    }
    async sendBasicConsumeAsync(channel, args) {
        await this.mux.send(channel, 60, 20, {
            ...args,
            nowait: true
        });
    }
    async sendBasicConsume(channel, args) {
        await this.mux.send(channel, 60, 20, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 60, 21);
    }
    async sendBasicCancelAsync(channel, args) {
        await this.mux.send(channel, 60, 30, {
            ...args,
            nowait: true
        });
    }
    async sendBasicCancel(channel, args) {
        await this.mux.send(channel, 60, 30, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 60, 31);
    }
    async sendBasicPublish(channel, args, props, data) {
        await Promise.all([
            this.mux.send(channel, 60, 40, args),
            this.mux.sendContent(channel, 60, props, data), 
        ]);
    }
    async sendBasicGet(channel, args) {
        await this.mux.send(channel, 60, 70, args);
        return Promise.race([
            this.mux.receive(channel, 60, 71),
            this.mux.receive(channel, 60, 72), 
        ]);
    }
    async sendBasicAck(channel, args) {
        await this.mux.send(channel, 60, 80, args);
    }
    async sendBasicReject(channel, args) {
        await this.mux.send(channel, 60, 90, args);
    }
    async sendBasicRecoverAsync(channel, args) {
        await this.mux.send(channel, 60, 100, args);
    }
    async sendBasicRecover(channel, args) {
        await this.mux.send(channel, 60, 110, args);
        return this.mux.receive(channel, 60, 111);
    }
    async sendBasicNack(channel, args) {
        await this.mux.send(channel, 60, 120, args);
    }
    async sendTxSelect(channel, args) {
        await this.mux.send(channel, 90, 10, args);
        return this.mux.receive(channel, 90, 11);
    }
    async sendTxCommit(channel, args) {
        await this.mux.send(channel, 90, 20, args);
        return this.mux.receive(channel, 90, 21);
    }
    async sendTxRollback(channel, args) {
        await this.mux.send(channel, 90, 30, args);
        return this.mux.receive(channel, 90, 31);
    }
    async sendConfirmSelectAsync(channel, args) {
        await this.mux.send(channel, 85, 10, {
            ...args,
            nowait: true
        });
    }
    async sendConfirmSelect(channel, args) {
        await this.mux.send(channel, 85, 10, {
            ...args,
            nowait: false
        });
        return this.mux.receive(channel, 85, 11);
    }
    async receiveConnectionStart(channel) {
        return this.mux.receive(channel, 10, 10);
    }
    async receiveConnectionSecure(channel) {
        return this.mux.receive(channel, 10, 20);
    }
    async receiveConnectionTune(channel) {
        return this.mux.receive(channel, 10, 30);
    }
    async receiveConnectionClose(channel) {
        return this.mux.receive(channel, 10, 50);
    }
    async receiveChannelFlow(channel) {
        return this.mux.receive(channel, 20, 20);
    }
    async receiveChannelClose(channel) {
        return this.mux.receive(channel, 20, 40);
    }
    async receiveBasicAck(channel) {
        return this.mux.receive(channel, 60, 80);
    }
    async receiveBasicNack(channel) {
        return this.mux.receive(channel, 60, 120);
    }
    subscribeConnectionStart(channel, handler) {
        return this.mux.subscribe(channel, 10, 10, handler);
    }
    subscribeConnectionSecure(channel, handler) {
        return this.mux.subscribe(channel, 10, 20, handler);
    }
    subscribeConnectionTune(channel, handler) {
        return this.mux.subscribe(channel, 10, 30, handler);
    }
    subscribeConnectionClose(channel, handler) {
        return this.mux.subscribe(channel, 10, 50, handler);
    }
    subscribeChannelFlow(channel, handler) {
        return this.mux.subscribe(channel, 20, 20, handler);
    }
    subscribeChannelClose(channel, handler) {
        return this.mux.subscribe(channel, 20, 40, handler);
    }
    subscribeBasicReturn(channel, handler) {
        return this.mux.subscribe(channel, 60, 50, async (method)=>{
            const [props, content] = await this.mux.receiveContent(channel, 60);
            return handler(method, props, content);
        });
    }
    subscribeBasicDeliver(channel, handler) {
        return this.mux.subscribe(channel, 60, 60, async (method)=>{
            const [props, content] = await this.mux.receiveContent(channel, 60);
            return handler(method, props, content);
        });
    }
    subscribeBasicAck(channel, handler) {
        return this.mux.subscribe(channel, 60, 80, handler);
    }
    subscribeBasicNack(channel, handler) {
        return this.mux.subscribe(channel, 60, 120, handler);
    }
}
function createSubscriber(handle, onError) {
    return {
        handle,
        error: onError
    };
}
function assertNotClosed(channel, frame) {
    if (frame.type === "method") {
        if (frame.channel === channel && frame.payload.classId === 20 && frame.payload.methodId === 40) {
            throw new Error(serializeChannelError(channel, frame.payload.args));
        }
        if (frame.payload.classId === 10 && frame.payload.methodId === 50) {
            throw new Error(serializeConnectionError(frame.payload.args));
        }
    }
}
function createSocketDemux(reader, subscribers) {
    listen();
    async function listen() {
        try {
            while(true){
                const frame = await reader.read();
                emit(frame);
            }
        } catch (error) {
            handleError(error);
        }
    }
    function removeSubscriber(subscriber) {
        const index = subscribers.indexOf(subscriber);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    }
    function handleError(error) {
        for (const subscriber of [
            ...subscribers
        ]){
            subscriber.error(error);
            removeSubscriber(subscriber);
        }
    }
    function emit(frame) {
        for (const subscriber of [
            ...subscribers
        ]){
            try {
                if (subscriber.handle(frame)) {
                    removeSubscriber(subscriber);
                }
            } catch (error) {
                subscriber.error(error);
                removeSubscriber(subscriber);
            }
        }
    }
    function addSubscriber(subscriber) {
        subscribers.push(subscriber);
    }
    async function receive(channel, classId, methodId) {
        return new Promise((resolve, reject)=>{
            addSubscriber(createSubscriber((frame)=>{
                if (frame.type === "method") {
                    if (frame.channel === channel && frame.payload.classId === classId && frame.payload.methodId === methodId) {
                        resolve(frame.payload.args);
                        return true;
                    }
                }
                assertNotClosed(channel, frame);
                return false;
            }, reject));
        });
    }
    function subscribe(channel, classId, methodId, handler) {
        const subscriber = createSubscriber((frame)=>{
            if (frame.type === "method") {
                if (frame.channel === channel && frame.payload.classId === classId && frame.payload.methodId === methodId) {
                    handler(frame.payload.args);
                }
            }
            return false;
        }, ()=>{
        });
        addSubscriber(subscriber);
        return ()=>removeSubscriber(subscriber)
        ;
    }
    async function receiveHeader(channel, classId) {
        return new Promise((resolve, reject)=>{
            addSubscriber(createSubscriber((frame)=>{
                if (frame.channel === channel && frame.type === "header" && frame.payload.classId === classId) {
                    resolve(frame.payload);
                    return true;
                }
                assertNotClosed(channel, frame);
                return false;
            }, reject));
        });
    }
    async function receiveContent(channel, classId) {
        const header = await receiveHeader(channel, classId);
        if (header.size === 0) {
            return [
                header.props,
                new Uint8Array(0)
            ];
        }
        const buffer = new Deno.Buffer();
        return new Promise((resolve, reject)=>{
            addSubscriber(createSubscriber((frame)=>{
                if (frame.channel === channel && frame.type === "content") {
                    buffer.writeSync(frame.payload);
                    if (buffer.length >= header.size) {
                        resolve([
                            header.props,
                            buffer.bytes()
                        ]);
                        return true;
                    }
                } else if (frame.channel === channel && frame.type !== "content") {
                    resolve([
                        header.props,
                        buffer.bytes()
                    ]);
                    return true;
                }
                assertNotClosed(channel, frame);
                return false;
            }, reject));
        });
    }
    return {
        receive: receive,
        receiveContent: receiveContent,
        subscribe: subscribe
    };
}
function createSocketMux(writer5) {
    async function send(channel, classId, methodId, args) {
        return writer5.write({
            type: "method",
            channel,
            payload: {
                classId,
                methodId,
                args
            }
        });
    }
    async function sendContent(channel, classId, props, data2) {
        const size8 = data2.length;
        if (size8 === 0) {
            await writer5.write({
                type: "header",
                channel,
                payload: {
                    classId,
                    props,
                    size: size8
                }
            });
        } else {
            await Promise.all([
                writer5.write({
                    type: "header",
                    channel,
                    payload: {
                        classId,
                        props,
                        size: size8
                    }
                }),
                writer5.write({
                    type: "content",
                    channel,
                    payload: data2
                }), 
            ]);
        }
    }
    return {
        send,
        sendContent
    };
}
function createAmqpMux(socket) {
    const subscribers = [];
    const demux = createSocketDemux(socket, subscribers);
    const mux1 = createSocketMux(socket);
    return {
        ...demux,
        ...mux1
    };
}
const NULL_CHAR = String.fromCharCode(0);
function credentials(username, password) {
    return `${NULL_CHAR}${username}${NULL_CHAR}${password}`;
}
const clientProperties = Object.freeze({
    product: "deno-amqp",
    platform: `Deno ${Deno.version.deno} https://deno.land`,
    version: "0",
    information: "https://deno.land/x/amqp/"
});
function tune(ours, theirs) {
    if (ours === undefined) {
        return theirs;
    }
    if (ours === 0) {
        return Math.max(ours, theirs);
    }
    return Math.min(ours, theirs);
}
class AmqpConnection {
    #channelMax=-1;
    #isOpen=false;
    #protocol;
    #channelNumbers=[];
    #username;
    #password;
    #vhost;
    #closedPromise;
    #options;
    #socket;
    constructor(socket, options1){
        this.#options = options1;
        this.#socket = socket;
        this.#protocol = new AmqpProtocol(createAmqpMux(this.#socket));
        this.#username = options1.username;
        this.#password = options1.password;
        this.#vhost = options1.vhost || "/";
        this.#closedPromise = createResolvable();
        this.#protocol.receiveConnectionClose(0).then(this.#handleClose).catch(this.#closedPromise.reject).finally(()=>{
            this.#isOpen = false;
        });
    }
    #handleClose=async (args)=>{
        this.#isOpen = false;
        await this.#protocol.sendConnectionCloseOk(0, {
        });
        this.#closedPromise.reject(new Error(serializeConnectionError(args)));
        this.#socket.close();
    };
    #handleStart=async (args)=>{
        await this.#protocol.sendConnectionStartOk(0, {
            clientProperties,
            response: credentials(this.#username, this.#password)
        });
    };
    #handleTune=async (args)=>{
        const heartbeatInterval = tune(this.#options.heartbeatInterval, args.heartbeat);
        this.#channelMax = tune(undefined, args.channelMax);
        const frameMax = tune(this.#options.frameMax, args.frameMax);
        await this.#protocol.sendConnectionTuneOk(0, {
            heartbeat: heartbeatInterval,
            channelMax: this.#channelMax,
            frameMax
        });
        this.#socket.tune({
            frameMax,
            sendTimeout: heartbeatInterval * 1000,
            readTimeout: heartbeatInterval * 1000 * 2
        });
        await this.#protocol.sendConnectionOpen(0, {
            virtualHost: this.#vhost
        });
    };
    async open() {
        await this.#socket.start();
        await this.#protocol.receiveConnectionStart(0).then(this.#handleStart);
        await this.#protocol.receiveConnectionTune(0).then(this.#handleTune);
        this.#isOpen = true;
    }
    async openChannel() {
        for(let channelNumber1 = 1; channelNumber1 < this.#channelMax; ++channelNumber1){
            if (!this.#channelNumbers.find((num)=>num === channelNumber1
            )) {
                this.#channelNumbers.push(channelNumber1);
                await this.#protocol.sendChannelOpen(channelNumber1, {
                });
                const channel = new AmqpChannel(channelNumber1, this.#protocol);
                return channel;
            }
        }
        throw new Error(`Maximum channels ${this.#channelMax} reached`);
    }
    async close() {
        if (this.#isOpen) {
            await this.#protocol.sendConnectionClose(0, {
                classId: 0,
                methodId: 0,
                replyCode: 320
            });
            this.#socket.close();
        }
        this.#isOpen = false;
        this.#closedPromise.resolve();
    }
    async closed() {
        return await this.#closedPromise;
    }
}
class AmqpClient {
    async connect(options) {
        this.generalOptions = Object.assign({
        }, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });
        this.fullClientOptions = Object.assign({
        }, options);
        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });
        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);
        try {
            await this.authenticate(options.options);
            this.connected = true;
            this.closed = false;
            return this;
        } catch (error) {
            console.log(error);
            this.closeConnection();
            throw error;
        }
    }
    async authenticate(data) {
        const { username , password , heartbeatInterval , frameMax , loglevel , vhost  } = data;
        const socket1 = new AmqpSocket(this.getConnection());
        const connection = new AmqpConnection(socket1, {
            username,
            password,
            heartbeatInterval,
            frameMax,
            loglevel,
            vhost
        });
        await connection.open();
        this.amqpConnection = connection;
    }
    reconnect() {
        throw new Error("Method not implemented.");
    }
    getConnectionOptions() {
        return this.fullClientOptions;
    }
    getReader() {
        return this.reader;
    }
    getWriter() {
        return this.writer;
    }
    getConnection() {
        return this.connection;
    }
    closeConnection() {
        this.closed = true;
        this.connection.close();
    }
    getRetryAttemps() {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }
    getRetryDelay() {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }
    isConnected() {
        return this.connected;
    }
    isClosed() {
        return this.closed;
    }
    getAs() {
        return this;
    }
    getSubscriber() {
        return this.amqpConnection;
    }
    async *receive(queueName) {
        if (!this.channel) {
            this.channel = await this.getSubscriber().openChannel();
            await this.channel.declareQueue({
                queue: queueName
            });
        }
        while(this.isConnected()){
            try {
                const resolvable = new Promise((resolve, reject)=>{
                    this.channel.consume({
                        queue: queueName
                    }, async (args, props, data2)=>{
                        try {
                            const result = {
                                args,
                                props,
                                data: data2
                            };
                            await this.channel.ack({
                                deliveryTag: args.deliveryTag
                            });
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
                const result = await resolvable;
                yield result;
            } catch  {
            }
        }
    }
    getDefaultPort() {
        return 5672;
    }
}
class EOFError extends Error {
}
class ErrorReplyError extends Error {
}
class InvalidStateError extends Error {
    constructor(){
        super("Invalid state");
    }
}
const IntegerReplyCode = ":".charCodeAt(0);
const BulkReplyCode = "$".charCodeAt(0);
const SimpleStringCode = "+".charCodeAt(0);
const ArrayReplyCode = "*".charCodeAt(0);
const ErrorReplyCode = "-".charCodeAt(0);
class RedisUtil {
    static async readLine(reader) {
        const buf = new Uint8Array(1024);
        let loc = 0;
        let d = null;
        while((d = await reader.readByte()) && d !== null){
            if (d === "\r".charCodeAt(0)) {
                const d1 = await reader.readByte();
                if (d1 === "\n".charCodeAt(0)) {
                    buf[loc++] = d;
                    buf[loc++] = d1;
                    return decoder.decode(new Deno.Buffer(buf.subarray(0, loc)).bytes());
                }
            }
            buf[loc++] = d;
        }
        throw new Error();
    }
    static async readReply(reader) {
        const res = await reader.peek(1);
        if (res === null) {
            throw new EOFError();
        }
        switch(res[0]){
            case IntegerReplyCode:
                return [
                    "integer",
                    await this.readIntegerReply(reader)
                ];
            case SimpleStringCode:
                return [
                    "status",
                    await this.readStatusReply(reader)
                ];
            case BulkReplyCode:
                return [
                    "bulk",
                    await this.readBulkReply(reader)
                ];
            case ArrayReplyCode:
                return [
                    "array",
                    await this.readArrayReply(reader)
                ];
            case ErrorReplyCode:
                this.tryParseErrorReply(await this.readLine(reader));
        }
        throw new InvalidStateError();
    }
    static createRequest(command, args) {
        const _args = args.filter((v)=>v !== void 0 && v !== null
        );
        let msg1 = "";
        msg1 += `*${1 + _args.length}\r\n`;
        msg1 += `$${command.length}\r\n`;
        msg1 += `${command}\r\n`;
        for (const arg of _args){
            const val = String(arg);
            const bytesLen = encoder.encode(val).byteLength;
            msg1 += `$${bytesLen}\r\n`;
            msg1 += `${val}\r\n`;
        }
        return msg1;
    }
    static async sendCommand(writer, reader, command, ...args) {
        const msg1 = this.createRequest(command, args);
        await writer.write(encoder.encode(msg1));
        await writer.flush();
        return this.readReply(reader);
    }
    static async readStatusReply(reader) {
        const line = await this.readLine(reader);
        if (line[0] === "+") {
            return line.substr(1, line.length - 3);
        }
        this.tryParseErrorReply(line);
    }
    static async readIntegerReply(reader) {
        const line = await this.readLine(reader);
        if (line[0] === ":") {
            const str = line.substr(1, line.length - 3);
            return parseInt(str);
        }
        this.tryParseErrorReply(line);
    }
    static async readBulkReply(reader) {
        const line = await this.readLine(reader);
        if (line[0] !== "$") {
            this.tryParseErrorReply(line);
        }
        const sizeStr = line.substr(1, line.length - 3);
        const size8 = parseInt(sizeStr);
        if (size8 < 0) {
            return undefined;
        }
        const dest = new Uint8Array(size8 + 2);
        await reader.readFull(dest);
        return decoder.decode(new Deno.Buffer(dest.subarray(0, dest.length - 2)).bytes());
    }
    static async readArrayReply(reader) {
        const line = await this.readLine(reader);
        const argCount = parseInt(line.substr(1, line.length - 3));
        const result = [];
        for(let i = 0; i < argCount; i++){
            const res = await reader.peek(1);
            if (res === null) {
                throw new EOFError();
            }
            switch(res[0]){
                case SimpleStringCode:
                    result.push(await this.readStatusReply(reader));
                    break;
                case BulkReplyCode:
                    result.push(await this.readBulkReply(reader));
                    break;
                case IntegerReplyCode:
                    result.push(await this.readIntegerReply(reader));
                    break;
                case ArrayReplyCode:
                    result.push(await this.readArrayReply(reader));
                    break;
            }
        }
        return result;
    }
    static tryParseErrorReply(line) {
        const code1 = line[0];
        if (code1 === "-") {
            throw new ErrorReplyError(line);
        }
        throw new Error(`invalid line: ${line}`);
    }
}
class RedisSubscription {
    patterns = {
    };
    channels = {
    };
    constructor(redisClient){
        this.redisClient = redisClient;
    }
    async patternSubscribe(...patterns) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "PSUBSCRIBE", ...patterns);
        for (const pat of patterns){
            this.patterns[pat] = true;
        }
    }
    async patternUnsubscribe(...patterns) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "PUNSUBSCRIBE", ...patterns);
        for (const pat of patterns){
            delete this.patterns[pat];
        }
    }
    async channelSubscribe(...channels) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "SUBSCRIBE", ...channels);
        for (const chan of channels){
            this.channels[chan] = true;
        }
        return this;
    }
    async channelUnsubscribe(...channels) {
        await RedisUtil.sendCommand(this.redisClient.getWriter(), this.redisClient.getReader(), "UNSUBSCRIBE", ...channels);
        for (const chan of channels){
            delete this.channels[chan];
        }
        return this;
    }
    async *receive() {
        let forceReconnect = false;
        while(this.redisClient.isConnected()){
            try {
                let rep;
                try {
                    rep = await RedisUtil.readArrayReply(this.redisClient.getReader());
                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        this.redisClient.closeConnection();
                        break;
                    }
                    throw err;
                }
                const ev = rep[0];
                if (ev === "message" && rep.length === 3) {
                    yield {
                        channel: rep[1],
                        message: rep[2]
                    };
                } else if (ev === "pmessage" && rep.length === 4) {
                    yield {
                        pattern: rep[1],
                        channel: rep[2],
                        message: rep[3]
                    };
                }
            } catch (error) {
                if (error instanceof InvalidStateError || error instanceof Deno.errors.BadResource) {
                    forceReconnect = true;
                } else throw error;
            } finally{
                if (!this.redisClient.isClosed() && !this.redisClient.isConnected() || forceReconnect) {
                    await this.redisClient.reconnect();
                    forceReconnect = false;
                    if (Object.keys(this.channels).length > 0) {
                        await this.channelSubscribe(...Object.keys(this.channels));
                    }
                    if (Object.keys(this.patterns).length > 0) {
                        await this.patternSubscribe(...Object.keys(this.patterns));
                    }
                }
            }
        }
    }
    async close() {
        try {
            await this.channelUnsubscribe(...Object.keys(this.channels));
            await this.patternUnsubscribe(...Object.keys(this.patterns));
        } finally{
            this.redisClient.closeConnection();
        }
    }
}
class RedisClient {
    async connect(options) {
        this.generalOptions = Object.assign({
        }, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });
        this.fullClientOptions = Object.assign({
        }, options);
        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });
        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);
        const { username , password  } = options.options;
        try {
            await this.authenticate({
                username,
                password
            });
            this.connected = true;
            this.closed = false;
            return this;
        } catch (error) {
            this.closeConnection();
            throw error;
        }
    }
    async authenticate(data) {
        const { username , password  } = data;
        if (password && !username) {
            return RedisUtil.sendCommand(this.writer, this.reader, "AUTH", password);
        } else if (password && username) {
            return RedisUtil.sendCommand(this.writer, this.reader, "AUTH", username, password);
        } else {
            throw new Error();
        }
    }
    async reconnect() {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        } else {
            try {
                await RedisUtil.sendCommand(this.writer, this.reader, "PING");
                this.connected = true;
            } catch (error) {
                let retries = 0;
                const resolvable = new Promise((resolve, reject)=>{
                    const reconnectionInterval = setInterval(async ()=>{
                        if (retries > this.getRetryAttemps()) {
                            this.closeConnection();
                            clearInterval(reconnectionInterval);
                            reject(new Error("Could not re-establish connection"));
                        }
                        try {
                            this.closeConnection();
                            await this.connect(this.getConnectionOptions());
                            await RedisUtil.sendCommand(this.getWriter(), this.getReader(), "PING");
                            this.connected = true;
                            retries = 0;
                            clearInterval(reconnectionInterval);
                            resolve();
                        } catch (error1) {
                        } finally{
                            retries = retries + 1;
                        }
                    }, this.getRetryDelay());
                });
                await resolvable;
            }
        }
    }
    getConnectionOptions() {
        return this.fullClientOptions;
    }
    getReader() {
        return this.reader;
    }
    getWriter() {
        return this.writer;
    }
    getConnection() {
        return this.connection;
    }
    closeConnection() {
        this.closed = true;
        this.connection.close();
    }
    getRetryAttemps() {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }
    getRetryDelay() {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }
    isConnected() {
        return this.connected;
    }
    isClosed() {
        return this.closed;
    }
    getAs() {
        return this;
    }
    async *receive() {
        return this.getSubscriber().receive();
    }
    getSubscriber() {
        if (this.redisSubscription === undefined) {
            this.redisSubscription = new RedisSubscription(this);
        }
        return this.redisSubscription;
    }
    exec(command, ...args) {
        return RedisUtil.sendCommand(this.getWriter(), this.getReader(), command, ...args);
    }
    getDefaultPort() {
        return 6379;
    }
}
class NATSerror extends Error {
}
class NatsUtil {
    static async writeIn(writer, message) {
        await writer.write(encoder.encode(message));
        await writer.flush();
    }
    static async readLine(reader) {
        const buf = new Uint8Array(1024);
        let loc = 0;
        let d = null;
        while((d = await reader.readByte()) && d !== null){
            if (d === "\r".charCodeAt(0)) {
                const d1 = await reader.readByte();
                if (d1 === "\n".charCodeAt(0)) {
                    buf[loc++] = d;
                    buf[loc++] = d1;
                    return decoder.decode(new Deno.Buffer(buf.subarray(0, loc)).bytes());
                }
            }
            buf[loc++] = d;
        }
        return "";
    }
    static createRequest(payload) {
        return `${payload}\r\n`;
    }
    static async sendCommand(writer, reader, payload) {
        await NatsUtil.writeIn(writer, NatsUtil.createRequest(payload));
        const [message3, status] = [
            await this.readLine(reader),
            await this.readLine(reader)
        ];
        const isOk = NatsUtil.validateStatus(status);
        return [
            message3,
            status,
            isOk
        ];
    }
    static processResponse(response) {
        return response.lastIndexOf("\r\n");
    }
    static async connect(writer, reader, data) {
        let command = `CONNECT`;
        command += ` ${JSON.stringify(data)}`;
        let [serverDataResponse, errorStatus, isOk] = await this.sendCommand(writer, reader, command);
        if (serverDataResponse.includes("INFO")) {
            serverDataResponse = serverDataResponse.replace("INFO ", "").trim();
        }
        return [
            serverDataResponse,
            errorStatus,
            isOk
        ];
    }
    static validateStatus(okLine) {
        const isError = okLine.startsWith("-ERR");
        if (isError) {
            let [, error] = okLine.substr(1).split("ERR ");
            throw new NATSerror(`(NATS) ${error}`);
        }
        return true;
    }
    static async exec(writer, reader, payload) {
        return await this.sendCommand(writer, reader, payload);
    }
    static getMessageTypeFromHeader(header) {
        if (header.includes("PING")) {
            return "PING";
        } else if (header.includes("PONG")) {
            return "PONG";
        } else if (header.includes("MSG")) {
            return "MSG";
        } else if (header.includes("INFO")) {
            return "INFO";
        } else {
            return "OTHER";
        }
    }
}
const replaceLast = (x, y, z)=>{
    var a = x.split("");
    a[x.lastIndexOf(y)] = z;
    return a.join("");
};
class NatsSubscription {
    patterns = {
    };
    constructor(natsClient){
        this.natsClient = natsClient;
    }
    async subscribe(subject, queueGroup) {
        if (subject.includes(" ")) {
            throw new NATSerror("The subject of a subscription cannot contain white spaces");
        }
        const clientId = this.natsClient.getNatsServerData().client_id;
        if (clientId) {
            if (queueGroup) {
                return await this.natsClient.exec(`SUB ${subject} ${queueGroup} ${clientId}`);
            } else {
                return await this.natsClient.exec(`SUB ${subject} ${clientId}`);
            }
        } else {
            throw new NATSerror("A subscription requires a valid client id, make sure your connection is established.");
        }
    }
    async unSubscribe(maxMessages) {
        const clientId = this.natsClient.getNatsServerData().client_id;
        if (clientId) {
            if (maxMessages) {
                return await this.natsClient.exec(`UNSUB ${clientId} ${maxMessages}`);
            } else {
                return await this.natsClient.exec(`UNSUB ${clientId}`);
            }
        } else {
            throw new NATSerror("NATS cannot unsubscribe an unexistent client");
        }
    }
    async publish(subject, payload, replyTo) {
        const finalPayload = typeof payload === "object" ? JSON.stringify(payload) : payload;
        if (replyTo) {
            return await this.natsClient.exec(`PUB ${subject} ${replyTo} ${finalPayload.length}\r\n${finalPayload}`);
        } else {
            return await this.natsClient.exec(`PUB ${subject} ${finalPayload.length}\r\n${finalPayload}`);
        }
    }
    async *receive() {
        let forceReconnect = false;
        while(this.natsClient.isConnected()){
            try {
                let subsMessage;
                try {
                    const reader = async ()=>await NatsUtil.readLine(this.natsClient.getReader())
                    ;
                    const header = await reader();
                    const type = NatsUtil.getMessageTypeFromHeader(header);
                    if (type === "MSG") {
                        const message3 = await reader();
                        const processedMessage = replaceLast(replaceLast(message3, "\r", ""), "\n", "");
                        let cleanHeader = replaceLast(replaceLast(header, "\r", ""), "\n", "");
                        let [, subject, sid, responseLength] = cleanHeader.split(" ");
                        subsMessage = {
                            type,
                            header: {
                                subject,
                                sid: parseInt(sid),
                                responseLength: parseInt(responseLength)
                            },
                            message: processedMessage
                        };
                    } else {
                        subsMessage = {
                            type,
                            header: header,
                            message: ""
                        };
                    }
                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        this.natsClient.closeConnection();
                        break;
                    }
                    throw err;
                }
                yield subsMessage;
            } finally{
                if (!this.natsClient.isClosed() && !this.natsClient.isConnected() || forceReconnect) {
                    await this.natsClient.reconnect();
                }
            }
        }
    }
}
class NatsClient {
    natsServerData = {
    };
    async connect(options) {
        options.options["verbose"] = true;
        this.generalOptions = Object.assign({
        }, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });
        this.fullClientOptions = Object.assign({
        }, options);
        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });
        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);
        try {
            await this.authenticate(options.options);
            this.connected = true;
            this.closed = false;
            return this;
        } catch (error) {
            this.closeConnection();
            throw error;
        }
    }
    async authenticate(data) {
        const [response, err, isOk] = await NatsUtil.connect(this.getWriter(), this.getReader(), data);
        if (isOk) {
            this.natsServerData = JSON.parse(response);
        }
    }
    async reconnect() {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        } else {
            try {
                await NatsUtil.sendCommand(this.writer, this.reader, "PING");
                this.connected = true;
            } catch (error) {
                let retries = 0;
                const resolvable = new Promise((resolve, reject)=>{
                    const reconnectionInterval = setInterval(async ()=>{
                        if (retries > this.getRetryAttemps()) {
                            this.closeConnection();
                            clearInterval(reconnectionInterval);
                            reject(new NATSerror("Could not re-establish connection"));
                        }
                        try {
                            this.closeConnection();
                            await this.connect(this.getConnectionOptions());
                            await NatsUtil.sendCommand(this.getWriter(), this.getReader(), "PING");
                            this.connected = true;
                            retries = 0;
                            clearInterval(reconnectionInterval);
                            resolve();
                        } catch (error1) {
                        } finally{
                            retries = retries + 1;
                        }
                    }, this.getRetryDelay());
                });
                await resolvable;
            }
        }
    }
    getConnectionOptions() {
        return this.fullClientOptions;
    }
    getReader() {
        return this.reader;
    }
    getWriter() {
        return this.writer;
    }
    getConnection() {
        return this.connection;
    }
    closeConnection() {
        this.closed = true;
        this.connection.close();
    }
    getRetryAttemps() {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }
    getRetryDelay() {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }
    isConnected() {
        return this.connected;
    }
    isClosed() {
        return this.closed;
    }
    getAs() {
        return this;
    }
    getNatsServerData() {
        return this.natsServerData;
    }
    exec(execData) {
        if (!this.isClosed() && this.isConnected()) {
            return NatsUtil.exec(this.getWriter(), this.getReader(), execData);
        } else {
            throw new NATSerror("Command could not be executed because connection is either closed or not established");
        }
    }
    getSubscriber() {
        if (this.subscriber === undefined) {
            this.subscriber = new NatsSubscription(this);
        }
        return this.subscriber;
    }
    async *receive() {
        return this.subscriber.receive();
    }
    getDefaultPort() {
        return 4222;
    }
}
var Transporters;
(function(Transporters1) {
    Transporters1["TCP"] = "TCP";
    Transporters1["AMQP"] = "AMQP";
    Transporters1["REDIS"] = "REDIS";
    Transporters1["NATS"] = "NATS";
})(Transporters || (Transporters = {
}));
class TcpClient {
    async connect(options) {
        this.generalOptions = Object.assign({
        }, {
            transport: options.transport,
            options: {
                host: options.options.host,
                port: options.options.port,
                retryAttempts: options.options.retryAttempts,
                retryDelay: options.options.retryDelay
            }
        });
        this.connection = await Deno.connect({
            port: this.generalOptions.options.port || ClientUtil.getDefaultPort(this.generalOptions.transport),
            hostname: this.generalOptions.options.host
        });
        this.reader = new BufReader(this.connection);
        this.writer = new BufWriter(this.connection);
        this.connected = true;
        this.closed = false;
        return this;
    }
    authenticate(data) {
        throw new Error("Method not implemented.");
    }
    reconnect(...args) {
        throw new Error("Method not implemented.");
    }
    getConnectionOptions() {
        throw new Error("Method not implemented.");
    }
    getReader() {
        return this.reader;
    }
    getWriter() {
        return this.writer;
    }
    getConnection() {
        return this.connection;
    }
    closeConnection() {
        this.connected = false;
        this.closed = true;
        this.connection.close();
    }
    getRetryAttemps() {
        return this.getConnectionOptions().options.retryAttempts || 3;
    }
    getRetryDelay() {
        return this.getConnectionOptions().options.retryDelay || 1000;
    }
    isConnected() {
        return this.connected;
    }
    isClosed() {
        return this.closed;
    }
    getSubscriber(...args) {
        throw new Error("Method not implemented.");
    }
    async *receive(...args) {
        throw new Error("Method not implemented.");
    }
    getDefaultPort() {
        throw new Error("Method not implemented.");
    }
}
class MicrolemonInternal {
    VALID_TRANSPORTERS = new Map();
    constructor(){
        this.registerTransporter("TCP", TcpClient);
        this.registerTransporter("REDIS", RedisClient);
        this.registerTransporter("NATS", NatsClient);
        this.registerTransporter("AMQP", AmqpClient);
    }
    registerTransporter(transporter, classObj) {
        const transporterName = transporter.toUpperCase();
        if (!this.VALID_TRANSPORTERS.has(transporterName)) {
            this.VALID_TRANSPORTERS.set(transporter.toUpperCase(), classObj);
        } else {
            throw new Error("Transporter is already registered");
        }
    }
    getTransporter(transporter) {
        if (this.VALID_TRANSPORTERS.has(transporter)) {
            return this.VALID_TRANSPORTERS.get(transporter);
        } else {
            throw new Error(`Transporter ${transporter} does not exist`);
        }
    }
    transporterExists(transporter) {
        return this.VALID_TRANSPORTERS.has(transporter);
    }
    static getInstance() {
        if (!MicrolemonInternal.instance) {
            MicrolemonInternal.instance = new MicrolemonInternal();
        }
        return MicrolemonInternal.instance;
    }
}
class Microlemon {
    async connect(options) {
        if (this.selectedClient === undefined) {
            const transporter = options.transport;
            const microserviceClient = MicrolemonInternal.getInstance().getTransporter(transporter);
            this.selectedClient = new microserviceClient();
        }
        return this.selectedClient.connect(options);
    }
    async authenticate(data) {
        return this.selectedClient.authenticate(data);
    }
    async reconnect() {
        return this.selectedClient.reconnect();
    }
    getConnectionOptions() {
        return this.selectedClient.getConnectionOptions();
    }
    getReader() {
        return this.selectedClient.getReader();
    }
    getWriter() {
        return this.selectedClient.getWriter();
    }
    getConnection() {
        return this.selectedClient.getConnection();
    }
    closeConnection() {
        return this.selectedClient.closeConnection();
    }
    getRetryAttemps() {
        return this.selectedClient.getRetryAttemps();
    }
    getRetryDelay() {
        return this.selectedClient.getRetryDelay();
    }
    isConnected() {
        return this.selectedClient.isConnected();
    }
    isClosed() {
        return this.selectedClient.isClosed();
    }
    getSubscriber(...args) {
        return this.selectedClient.getSubscriber(...args);
    }
    async *receive(...params) {
        return this.selectedClient.receive(...params);
    }
    getDefaultPort() {
        return this.selectedClient.getDefaultPort();
    }
    getSelectedClient() {
        return this.selectedClient;
    }
}
let microserviceConnection = undefined;
const buildPostMessage = (data2)=>{
    return JSON.stringify(data2);
};
const initializeMicroservice = async (configuration)=>{
    if (!microserviceConnection) {
        try {
            microserviceConnection = await new Microlemon().connect(configuration);
            self.postMessage(buildPostMessage({
                message: "MANDARINE_MICROSERVICE_READY"
            }));
        } catch (error) {
            self.postMessage(buildPostMessage({
                message: "MANDARINE_MICROSERVICE_FAILURE",
                data: error
            }));
        }
    }
};
const subscribeAndListen = async (subscription)=>{
    if (microserviceConnection) {
        switch(subscription.transporter.toUpperCase()){
            case Transporters.AMQP:
                (async ()=>{
                    for await (const data2 of microserviceConnection.receive(subscription.channels[0])){
                        self.postMessage(buildPostMessage({
                            message: data2
                        }));
                    }
                })();
                break;
            case Transporters.REDIS:
                const subscriber = await microserviceConnection.getSubscriber().channelSubscribe(...subscription.channels);
                (async function() {
                    for await (const { channel , message: message3  } of subscriber.receive()){
                        self.postMessage(buildPostMessage({
                            message: {
                                channel: channel,
                                message: message3
                            }
                        }));
                    }
                })();
                break;
            case Transporters.NATS:
                const natsSubscriber = microserviceConnection.getSubscriber();
                const [channelToSubscribe, queueGroup] = subscription.channels;
                await subscriber.subscribe(channelToSubscribe, queueGroup);
                (async function() {
                    for await (const data2 of natsSubscriber.receive()){
                        self.postMessage(buildPostMessage({
                            message: data2
                        }));
                    }
                })();
                break;
        }
    }
};
self.onmessage = async ({ data: data2  })=>{
    const cmdObject = data2;
    switch(cmdObject.cmd){
        case "INITIALIZE":
            await initializeMicroservice(cmdObject.configuration);
            break;
        case "LISTEN":
            await subscribeAndListen(data2);
            break;
        case "HEALTH":
            await self.postMessage(buildPostMessage({
                message: "ALIVE"
            }));
            break;
    }
};
