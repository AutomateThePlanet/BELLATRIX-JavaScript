import { select } from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

export class Utilities {
    static isConstructor(constructor: any) {
        try {
          Reflect.construct(String, [], constructor);
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