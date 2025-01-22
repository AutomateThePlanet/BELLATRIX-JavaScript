export class UnsupportedImageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnsupportedImageError';
    }
}

export class Image {
    private _buffer: Buffer;
    private _type: keyof typeof this.SIGNATURES;

    private readonly SIGNATURES = {
        'png': Uint8Array.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
        'bmp': Uint8Array.from([0x42, 0x4D]),
        'jpeg': Uint8Array.from([0xFF, 0xD8, 0xFF]),
        'gif89a': Uint8Array.from(Buffer.from('GIF89a', 'ascii')),
        'tiff-le': Uint8Array.from([0x49, 0x49, 0x2A, 0x00]), // TIFF little-endian
        'tiff-be': Uint8Array.from([0x4D, 0x4D, 0x00, 0x2A]), // TIFF big-endian
        // Add more formats in the future
    } as const;

    private constructor(buffer: Buffer) {
        this._buffer = buffer;
        this._type = this.determineType(buffer);
    }

    static fromBuffer(buffer: Buffer) {
        return new Image(buffer);
    }

    static fromBase64(base64String: string) {
        const buffer = Buffer.from(base64String, 'base64');
        return new Image(buffer);
    }

    static fromDataURI(dataURI: string) {
        if (!(dataURI.startsWith('data:') && dataURI.includes(';base64,'))) {
            throw new Error('Invalid data URI format.');
        }

        const base64String = dataURI.split(';base64,')[1];
        return Image.fromBase64(base64String);
    }

    get type(): Exclude<keyof typeof this.SIGNATURES, 'tiff-le' | 'tiff-be'> | 'tiff' {
        return this._type === 'tiff-le' || this._type === 'tiff-be' ? 'tiff' : this._type;
    }

    get base64(): string {
        return this.buffer.toString('base64');
    }

    get dataURI(): string {
        return `data:image/${this.type};base64,${this.base64}`;
    }

    get width(): number {
        switch (this._type) {
            case 'png':
                return this.buffer.readUInt32BE(16);
            case 'bmp':
                return this.buffer.readUInt32LE(18);
            case 'gif89a':
                return this.buffer.readUInt16LE(6);
            case 'jpeg':
                return this.buffer.readUInt16BE(this.buffer.indexOf('ffc0', 0, 'hex') + 5); // not tested thoroughly
            case 'tiff-le': {
                const offset = this.buffer.indexOf('0001', this.buffer.readUInt32LE(4), 'hex');
                const dataType = this.buffer.readUInt16LE(offset + 2);
                const dataCount = this.buffer.readUInt32LE(offset + 4)
                let width = 0;

                for (let i = 0; i < dataCount; i++) {
                    if (dataType === 3) {
                        width += this.buffer.readUInt16LE(offset + 8);
                        continue;
                    }

                    if (dataType === 4) {
                        width += this.buffer.readUInt32LE(offset + 8);
                        continue;
                    }

                    throw new UnsupportedImageError('Unexpected opreation: Invalid data type for width in TIFF image.')
                }

                return width;
            }
            case 'tiff-be': {
                const offset = this.buffer.indexOf('0100', this.buffer.readUInt32BE(4), 'hex');
                const dataType = this.buffer.readUInt16BE(offset + 2);
                const dataCount = this.buffer.readUInt32BE(offset + 4)
                let width = 0;

                for (let i = 0; i < dataCount; i++) {
                    if (dataType === 3) {
                        width += this.buffer.readUInt16BE(offset + 8);
                        continue;
                    }

                    if (dataType === 4) {
                        width += this.buffer.readUInt32BE(offset + 8);
                        continue;
                    }

                    throw new UnsupportedImageError('Unexpected opreation: Invalid data type for width in TIFF image.')
                }

                return width;
            }
            default:
                throw new UnsupportedImageError('Unsupported operation: Image dimensions not supported by format.');
        }
    }

    get height(): number {
        switch (this._type) {
            case 'png':
                return this.buffer.readUInt32BE(20);
            case 'bmp':
                return this.buffer.readUInt32LE(22);
            case 'gif89a':
                return this.buffer.readUInt16LE(8);
            case 'jpeg':
                return this.buffer.readUInt16BE(this.buffer.indexOf(Uint8Array.from([0xFF, 0xC0]), 0, 'hex') + 7);
            case 'tiff-le': {
                const offset = this.buffer.indexOf('0101', this.buffer.readUInt32LE(4), 'hex');
                const dataType = this.buffer.readUInt16LE(offset + 2);
                const dataCount = this.buffer.readUInt32LE(offset + 4)
                let height = 0;

                for (let i = 0; i < dataCount; i++) {
                    if (dataType === 3) {
                        height += this.buffer.readUInt16LE(offset + 8);
                        continue;
                    }

                    if (dataType === 4) {
                        height += this.buffer.readUInt32LE(offset + 8);
                        continue;
                    }

                    throw new UnsupportedImageError('Unexpected opreation: Invalid data type for height in TIFF image.')
                }

                return height;
            }
            case 'tiff-be': {
                const offset = this.buffer.indexOf('0101', this.buffer.readUInt32BE(4), 'hex');
                const dataType = this.buffer.readUInt16BE(offset + 2);
                const dataCount = this.buffer.readUInt32BE(offset + 4)
                let height = 0;

                for (let i = 0; i < dataCount; i++) {
                    if (dataType === 3) {
                        height += this.buffer.readUInt16BE(offset + 8);
                        continue;
                    }

                    if (dataType === 4) {
                        height += this.buffer.readUInt32BE(offset + 8);
                        continue;
                    }

                    throw new UnsupportedImageError('Unexpected opreation: Invalid data type for height in TIFF image.')
                }

                return height;
            }
            default:
                throw new UnsupportedImageError('Unsupported operation: Image dimensions not supported by format.');
        }
    }

    protected get buffer() {
        return this._buffer;
    }

    protected determineType(buffer: Buffer): keyof typeof this.SIGNATURES {
        for (const [format, signature] of Object.entries(this.SIGNATURES)) {
            if (buffer.subarray(0, signature.length).equals(signature)) {
                return format as keyof typeof this.SIGNATURES;
            }
        }

        throw new UnsupportedImageError('Unsupported image format.')
    }
}