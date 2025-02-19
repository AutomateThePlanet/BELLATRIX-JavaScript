export class Utilities {
    static isConstructor(constructor: unknown) {
        try {
            Reflect.construct(String, [], constructor as new (...args: never) => never);
        } catch (e) {
            return false;
        }
        return true;
    }

    static decodeHtml(encodedString: string) {
        const translateRegex = /&(nbsp|amp|quot|lt|gt);/g;
        const translate = {
            'nbsp': ' ',
            'amp' : '&',
            'quot': '"',
            'lt'  : '<',
            'gt'  : '>'
        } as const;

        return encodedString.replace(translateRegex, (_, entity: keyof typeof translate) => {
            return translate[entity];
        }).replace(/&#(\d+);/gi, (_, numStr) => {
            const num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        }).replace(/&#x(\d+);/gi, (_, numStr) => {
            const num = parseInt(numStr, 16);
            return String.fromCharCode(num);
        });
    }
}
