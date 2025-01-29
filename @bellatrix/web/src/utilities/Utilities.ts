import { DOMParser } from '@xmldom/xmldom';
import { select } from 'xpath';

import { WebElement } from '@bellatrix/web/infrastructure/browsercontroller/core';

export class Utilities {
    static async relativeToAbsoluteXpath(searchContext: WebElement, xpath: string): Promise<string[]> {
        const ROOT_NODE_NAME = 'root';

        const data = await searchContext.evaluate<[string, string]>((el: Node) => {
            const paths = [];
            while (el && el.nodeType === 1 && el.parentNode) {
                const tagName = el.nodeName;
                const parentNode = el.parentNode;
                let index = 1;
                while (el.previousSibling) {
                    el = el.previousSibling;
                    if (el.nodeType === 1 && el.nodeName === tagName) {
                        index++;
                    }
                }

                paths.push(`${tagName.toLowerCase()}[${index}]`);

                el = parentNode;
            }

            return [`${paths.toReversed().join('/')}`, (el as unknown as InnerHTML).innerHTML] as const;
        });

        const xpathToStartFrom = data[0];
        const htmlSource = data[1];
        const html = new DOMParser({ errorHandler: { warning: () => {} }}).parseFromString(`<${ROOT_NODE_NAME}>${htmlSource}</${ROOT_NODE_NAME}>`, 'text/xml');

        const xpathResult = select(`(${xpathToStartFrom === '' ? ROOT_NODE_NAME : ROOT_NODE_NAME + '/' + xpathToStartFrom})${xpath}`, html);

        if (Array.isArray(xpathResult)) {
            return xpathResult.map(currentNode => {
                const paths = [];
                while (currentNode && currentNode.nodeType === 1 && currentNode.parentNode) {
                    const tagName = currentNode.nodeName;
                    const parentNode = currentNode.parentNode;
                    let index = 1;
                    while (currentNode.previousSibling) {
                        currentNode = currentNode.previousSibling;
                        if (currentNode.nodeType === 1 && currentNode.nodeName === tagName) {
                            index++;
                        }
                    }

                    paths.push(`${tagName}[${index}]`);

                    if (parentNode.nodeName === ROOT_NODE_NAME) {
                        break;
                    }

                    currentNode = parentNode;
                }

                return `/${paths.toReversed().join('/')}`;
            });
        }

        throw Error('The given XPath does not return an element.');
    }

    static async relativeXpathToAbsoluteCss(searchContext: WebElement, xpath: string): Promise<string[]> {
        const absoluteXpaths = await Utilities.relativeToAbsoluteXpath(searchContext, xpath);
        return absoluteXpaths.map(absoluteXpath => {
            const cssSelector = absoluteXpath.split('/').filter(Boolean).map(currentXpath => {
                return currentXpath.replace(/(\w+)(\[\d+\])?/g, (_, tagName, index) => {
                    return `${tagName}:nth-child(${index?.slice(1, -1)})`;
                });
            });

            return cssSelector.join(' > ');
        });
    }
}
