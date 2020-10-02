// Copyright 2020-2020 The Mandarine.TS Framework authors. All rights reserved. MIT license.

/**
 * The optional class is used to avoid repetitive validation with If's.
 * If an object is present, you can verify this with Optional.isPresent()
 * If An object is not present but you would like to get a default value, you can do this with Optional.orElseGet(defaultValue);
 * This classs allows you to avoid null exceptions.
 */
export class Optional<T> {

    /**
     * Default empty optional
     */
    private static readonly EMPTY: Optional<any> = new Optional<any>();

    /**
     * "Optionable" object.
     */
    private value: T | null;

    constructor() {
        this.value = null;
    }

    /**
     * Returns a empty optional
     */
    public static empty<T>(): Optional<T> {
        let returnT: Optional<T> = <Optional<T>> <unknown> this.EMPTY;
        return returnT; 
    }

    /**
     * Creates a new optional from a value which will be the optional's object.
     */
    public static of<T>(value: T): Optional<T> {
        let opt = new Optional<T>();
        opt.value = value;
        return opt;
    }

    /**
     * Creates a Optional instance.
     * if @param value is provided but it is either null or undefined, then it creates an empty instance of Optional.
     */
    public static ofNullable<T>(value: T): Optional<T> {
        return ((value == null) ? this.empty<T>() : this.of<T>(value));
    }

    /**
     * Gets the value of the Optional only if it is present. If value is not present, an exception will be thrown.
     */
    public get(): T {
        if(this.value == null) throw new Error('No value present');
        return this.value;
    }

    /**
     * Returns a boolean value of whether the optional value is present.
     */
    public ifPresent(): boolean {
        return this.value != null;
    }

    /**
     * Returns the value present in the Optional instance.
     * if @param value is an Optional, it will invoke "get", otherwise it will return the whole value. If not value is present, it will return undefined.
     */
    public orElseGet(value: Optional<T> | T): T {
        if(this.value != (null || undefined)) {
            if(this.value instanceof Optional) {
                return this.value.get();
            } else {
                return this.value;
            }
        } else {
            return <any> value;
        }
    }

    /**
     * Tries to get the value in Optional. If value is not present, it will throw an exception.
     * @param exception , exception to be thrown.
     */
    public orElseThrows(exception: Error) {
        if(this.value != null) {
            return this.value;
        } else {
            throw exception;
        }
    }

    public toString(): String {
        return this.value != null ? `Optional[${this.value}]` : `Optional.empty`;
    }
}