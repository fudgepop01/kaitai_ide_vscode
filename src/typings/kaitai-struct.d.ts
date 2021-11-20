declare module "kaitai-struct/KaitaiStream" {
    // Based on 0.9.0
    
    type AConstructorTypeOf<T> = new (...args:any[]) => T;

    class EOFError extends Error {
        name: 'EOFError';
        message: string;
        bytesReq: number;
        bytesAvail: number;
    }

    class UndecidedEndiannessError extends Error {
        name: 'UndecidedEndiannessError';
    }

    class ValidationNotEqualError extends Error {
        name: 'ValidationNotEqualError';
        message: string;
        expected: unknown | null;
        actual: unknown | null;
    }

    class ValidationLessThanError extends Error {
        name: 'ValidationLessThanError';
        message: string;
        min: unknown | null;
        actual: unknown | null;
    }
    class ValidationGreaterThanError extends Error {
        name: 'ValidationGreaterThanError';
        message: string;
        max: unknown | null;
        actual: unknown | null;
    }
    class ValidationNotAnyOfError extends Error {
        name: 'ValidationNotAnyOfError';
        message: string;
        actual: unknown | null;
    }
    class ValidationExprError extends Error {
        name: 'ValidationExprError';
        message: string;
        actual: unknown | null;
    }

    export default class KaitaiStream {
        public static EOFError: AConstructorTypeOf<EOFError>;
        public static UndecidedEndiannessError: AConstructorTypeOf<UndecidedEndiannessError>;
        public static ValidationNotEqualError: AConstructorTypeOf<ValidationNotEqualError>;
        public static ValidationLessThanError: AConstructorTypeOf<ValidationLessThanError>;
        public static ValidationGreaterThanError: AConstructorTypeOf<ValidationGreaterThanError>;
        public static ValidationNotAnyOfError: AConstructorTypeOf<ValidationNotAnyOfError>;
        public static ValidationExprError: AConstructorTypeOf<ValidationExprError>;

        /**
         * Native endianness. Either KaitaiStream.BIG_ENDIAN or KaitaiStream.LITTLE_ENDIAN
         * depending on the platform endianness.
         */
        public static endianness: boolean;

        /**
         * Dependency configuration data. Holds urls for (optional) dynamic loading 
         * of code dependencies from a remote server. For use by (static) processing functions.
         */
        public static depUrls: { zlib?: string | null };

        /**
         * Set/get the backing ArrayBuffer of the KaitaiStream object.
         * 
         * The setter updates the DataView to point to the new buffer.
         */
        public get buffer(): ArrayBuffer;
        public set buffer(value: ArrayBuffer);

        /**
         * Set/get the byteOffset of the KaitaiStream object.
         * 
         * The setter updates the DataView to point to the new byteOffset.
         */
        public get byteOffset(): number;
        public set byteOffset(value: number);

        /**
         * Gets/sets the backing DataView of the KaitaiStream object.
         * 
         * The setter updates the buffer and byteOffset to point to the DataView values.
         */
        public get dataView(): DataView;
        public set dataView(value: DataView);

        /**
         * Gets the byte length of the KaitaiStream object.
         */
        public get size(): number;

        public constructor(arrayBuffer: ArrayBuffer, byteOffset?: number);

        /**
         * Returns true if the KaitaiStream seek pointer is at the end of buffer and
         * there's no more data to read.
         */
        public isEof(): boolean;

        /**
         * Sets the KaitaiStream read/write position to given position. 
         * 
         * Clamps between 0 and KaitaiStream length.
         * @param pos The position to seek to.
         */
        public seek(pos: number): void;

        /**
         * Ensures that we have an least `length` bytes left in the stream.
         * If that's not true, throws an EOFError.
         * @param length Number of bytes to require.
         */
        public ensureBytesLeft(length: number);

        /**
         * Maps a Uint8Array into the KaitaiStream buffer.
         * 
         * Nice for quickly reading in data.
         * @param length Number of elements to map.
         */
        public mapUint8Array(length): Uint8Array;

        /**
         * Reads a 16-bit big-endian signed int from the stream.
         */
        public readS2be(): number;
        /**
         * Reads a 32-bit big-endian signed int from the stream.
         */
        public readS4be(): number;
        /**
         * Reads a 64-bit big-endian unsigned int from the stream. 
         * 
         * Note that JavaScript does not support 64-bit integers natively, so it will
         * automatically upgrade internal representation to use IEEE 754
         * double precision float.
         */
        public readS8be(): number;

        /**
         * Reads a 16-bit little-endian signed int from the stream.
         */
        public readS2le(): number;
        /**
         * Reads a 32-bit little-endian signed int from the stream.
         */
        public readS4le(): number;
        /**
         * Reads a 64-bit little-endian unsigned int from the stream. 
         * 
         * Note that JavaScript does not support 64-bit integers natively, so it will
         * automatically upgrade internal representation to use IEEE 754
         * double precision float.
         */
        public readS8le(): number;

        /**
         * Reads an 8-bit unsigned int from the stream.
         */
        public readU1(): number;

        /**
         * Reads a 16-bit big-endian unsigned int from the stream.
         */
        public readU2be(): number;
        /**
         * Reads a 32-bit big-endian unsigned int from the stream.
         */
        public readU4be(): number;
        /**
         * Reads a 64-bit big-endian unsigned int from the stream. 
         * 
         * Note that JavaScript does not support 64-bit integers natively, so it will
         * automatically upgrade internal representation to use IEEE 754
         * double precision float.
         */
        public readU8be(): number;

        /**
         * Reads a 16-bit little-endian unsigned int from the stream.
         */
        public readU2le(): number;
        /**
         * Reads a 32-bit little-endian unsigned int from the stream.
         */
        public readU4le(): number;
        /**
         * Reads a 64-bit little-endian unsigned int from the stream. 
         * 
         * Note that JavaScript does not support 64-bit integers natively, so it will
         * automatically upgrade internal representation to use IEEE 754
         * double precision float.
         */
        public readU8le(): number;

        public readF4be(): number;
        public readF8be(): number;

        public readF4le(): number;
        public readF8le(): number;

        public alignToByte(): void;

        public readBitsIntBe(n: number): number;
        public readBitsIntLe(n: number): number;

        public readBytes(len: number);
        public readBytesFull();
        public readBytesTerm(terminator, include, consume, eosError);

        public static bytesStripRight(data, padRight);
        public static bytesTerminate(data, term, include);
        public static bytesToStr(arr, encoding?: string): string;
        /**
         * Creates an array from an array of character codes. 
         * Uses `String.fromCharCode` in chunks for memory efficiency
         * and then concatenates the resulting string chunks.
         * @param array Array of character codes.
         */
        public static createStringFromArray(array: Uint8Array): string;
        /**
         * Creates an array from an array of character codes. 
         * Uses `String.fromCharCode` in chunks for memory efficiency
         * and then concatenates the resulting string chunks.
         * @param array Array of character codes.
         */
        public static createStringFromArray<T>(array: T[]): string;
        public static processXorOne(data: Uint8Array, key): Uint8Array;
        public static processXorMany(data: Uint8Array, key): Uint8Array;
        public static processRotateLeft(data: Uint8Array, amount: number, groupSize: number): Uint8Array;
        public static processZlib(buf);
    }
}