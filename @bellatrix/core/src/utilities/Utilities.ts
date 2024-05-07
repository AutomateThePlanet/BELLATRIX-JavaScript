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

    static relativeToAbsoluteXpath(htmlSource: string, xpath: string): string[] {
        var html = new DOMParser().parseFromString(htmlSource, 'text/xml');
        let xpathResult = select(xpath, html);

        if (xpathResult?.hasOwnProperty('nodeType')) {
            xpathResult = [xpathResult as Node];
        }
        
        if (Array.isArray(xpathResult)) {
            return xpathResult.map(currentNode => {
                const paths = [];

                while (currentNode && currentNode.nodeType === 1 && currentNode.parentNode) {
                    currentNode = currentNode.parentNode;
                    const tagName = currentNode.nodeName;

                    let index = 1;
                    while (currentNode.previousSibling) {
                        currentNode = currentNode.previousSibling;
                        if (currentNode.nodeType === 1 && currentNode.nodeName === tagName) {
                            index++;
                        }
                    }

                    paths.push(`${tagName}[${index}]`);
                }

                return `/${paths.toReversed().join('/')}`;
            })
        }

        throw Error("The given XPath does not return an element.");
    }

    static relativeXpathToAbsoluteCss(htmlSoruce: string, xpath: string): string[] {
        const absoluteXpaths = Utilities.relativeToAbsoluteXpath(htmlSoruce, xpath);

        return absoluteXpaths.map(absoluteXpath => {
            const cssSelector = absoluteXpath.split('/').filter(Boolean).map(currentXpath => {
                return currentXpath.replace(/(\w+)(\[\d+\])?/g, (_, tagName, index) => {
                    return `${tagName}:nth-child(${index?.slice(1, -1)})`;
                })
            });

            return cssSelector.join(' > ');
        })
    }
}