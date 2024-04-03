// @ts-ignore
import { Browser, Builder, WebDriver as NativeWebDriver } from "selenium-webdriver";
import { chromium, firefox, webkit } from "@playwright/test"

import { BrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/core";
import { SeleniumBrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/selenium";
import { PlaywrightBrowserAutomationTool } from "@bellatrix/web/infrastructure/browserautomationtools/playwright";
import { BellatrixSettings } from "@bellatrix/core/settings";
import { HttpClient } from "@bellatrix/core/http";

import type { BrowserAutomationToolType, BrowserType } from "@bellatrix/web/types";

export type BrowserConfiguration = {
    type: BrowserAutomationToolType;
    browser: BrowserType;
}

export class BrowserAutomationToolLaunchService {
    static async launch(browserConfiguration: BrowserConfiguration): Promise<BrowserAutomationTool> {
        const webSettings = BellatrixSettings.get().webSettings;

        const timeoutSettings = webSettings.timeoutSettings;

        const baseUrl = webSettings.executionSettings.baseUrl;
        const viewport = webSettings.executionSettings.viewport;
        const headless = webSettings.executionSettings.headless;
        const shouldStartMaximized = webSettings.executionSettings.startMaximized;

        switch (browserConfiguration.type) {
            case 'playwright': {
                let browser;
                switch (browserConfiguration.browser) {
                    case 'chrome':
                    case 'edge':
                        const args = [];

                        if (shouldStartMaximized) {
                            args.push('--start-maximized');
                        }

                        const channel = browserConfiguration.browser == 'chrome' ? 'chrome' : 'msedge';

                        browser = await chromium.launch({ headless, args }) // TODO: add chromium/edge?
                        const gridUrl = new URL('http://192.168.100.5:4444');
                        const response = await new HttpClient(gridUrl).sendRequest<{value: { sessionId: string, capabilities: { 'se:cdp': string }}}>({
                            path: '/session',
                            method: 'POST',
                            data: {
                                capabilities: {
                                    alwaysMatch: {
                                        browserName: "chrome"
                                    }
                                }
                            },
                        });

                        const cdpUrl = new URL(response.body.value.capabilities["se:cdp"]);
                        cdpUrl.host = gridUrl.host;
                        browser = await chromium.connectOverCDP(cdpUrl.href);
                        await new HttpClient(new URL('http://192.168.110.72:4444')).sendRequest({ path: `/session/${response.body.value.sessionId}`, method: 'DELETE' });
                        break;
                    case 'firefox':
                        if (shouldStartMaximized) {
                            console.warn('Unable to maximize Firefox in Playwright.') // TODO: better warning?
                        }

                        browser = await firefox.launch({ headless })
                        
                        break;
                    case 'safari':
                        if (shouldStartMaximized) {
                            console.warn('Unable to maximize WebKit in Playwright.') // TODO: better warning?
                        }

                        browser = await webkit.launch({ headless })
                        break;
                    default:
                        throw Error('unsupported browser')
                }

                if (browser.contexts().length > 0) {
                    for (const c of browser.contexts()) {
                        await c.close()
                    }
                }
                const context = await browser.newContext({ viewport: viewport ?? null });

                const page = await context.newPage();

                const webBrowser = new PlaywrightBrowserAutomationTool(browser, context, page);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            case 'selenium': {
                let browser;
                switch (browserConfiguration.browser) {
                    case 'chrome':
                        browser = Browser.CHROME;
                        break;
                    case 'edge':
                        browser = Browser.EDGE;
                        break;
                    case 'firefox':
                        browser = Browser.FIREFOX;
                        break;
                    case 'safari':
                        browser = Browser.SAFARI;
                        break;
                    default:
                        throw Error('unsupported browser'); // TODO: Add more specific error
                }

                const driver = new Builder()
                    .forBrowser(browser) // TODO: Make it support multiple browsers
                    .build() as NativeWebDriver;

                await driver.manage().setTimeouts({pageLoad: timeoutSettings.pageLoadTimeout, script: timeoutSettings.scriptTimeout});

                if (shouldStartMaximized) {
                    await driver.manage().window().maximize();
                }
                
                if (viewport) {
                    await driver.manage().window().setRect({ x: 0, y: 0, ...viewport });
                }

                const webBrowser = new SeleniumBrowserAutomationTool(driver);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            default:
                throw new Error("unknown driver"); // TODO: Add more specific error
        }
    }
}