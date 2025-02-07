import { Browser, Builder, WebDriver as NativeWebDriver } from 'selenium-webdriver';
import * as googleChrome from 'selenium-webdriver/chrome';
import * as mozillaFirefox from 'selenium-webdriver/firefox';
import * as microsoftEdge from 'selenium-webdriver/edge';
import { chromium, firefox, webkit } from '@playwright/test';

import { BrowserController } from '@bellatrix/web/infrastructure/browsercontroller/core';
import { SeleniumBrowserController } from '@bellatrix/web/infrastructure/browsercontroller/selenium';
import { PlaywrightBrowserController } from '@bellatrix/web/infrastructure/browsercontroller/playwright';
import { BellatrixSettings } from '@bellatrix/core/settings';
import { HttpClient } from '@bellatrix/core/http';

import type { BrowserControllerType, BrowserType } from '@bellatrix/web/types';

export type BrowserConfiguration = {
    type: BrowserControllerType;
    browser: BrowserType;
}

export class BrowserControllerLifecycleManager {
    static async launch(): Promise<BrowserController> {
        const webSettings = BellatrixSettings.get().webSettings;

        if (webSettings.executionSettings.executionType === 'remote') {
            return this.launchRemote();
        }

        const timeoutSettings = webSettings.timeoutSettings;

        const baseUrl = webSettings.executionSettings.baseUrl;
        const viewport = webSettings.executionSettings.viewport;
        const headless = webSettings.executionSettings.headless;
        const shouldStartMaximized = webSettings.executionSettings.startMaximized;

        switch (webSettings.executionSettings.browserController.toLowerCase()) {
            case 'playwright': {
                let browser;
                switch (webSettings.executionSettings.browser.toLowerCase()) {
                    case 'chrome':
                    case 'edge':
                        const args = [];

                        if (shouldStartMaximized) {
                            args.push('--start-maximized');
                        }

                        const channel = webSettings.executionSettings.browser == 'chrome' ? 'chrome' : 'msedge';

                        browser = await chromium.launch({
                            headless,
                            channel,
                            args,
                            // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // uncomment if Chrome is installed in Program Files (for all users)
                        });

                        break;
                    case 'firefox':
                        if (shouldStartMaximized) {
                            console.warn('Not possible to launch Firefox maximized in Playwright.');
                        }

                        browser = await firefox.launch({ headless });

                        break;
                    case 'safari':
                        if (shouldStartMaximized) {
                            console.warn('Not possible to launch WebKit maximized in Playwright.');
                        }

                        browser = await webkit.launch({ headless });
                        break;
                    default:
                        throw Error('Browser not yet supported by Bellatrix Test Automation Framework.');
                }

                const context = await browser.newContext({ viewport: viewport ?? null });

                const page = await context.newPage();

                const webBrowser = new PlaywrightBrowserController(browser, context, page);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            case 'selenium': {
                let builder: Builder;
                switch (webSettings.executionSettings.browser.toLowerCase()) {
                    case 'chrome':
                        builder = new Builder().forBrowser(Browser.CHROME);

                        if (headless) {
                            const options = new googleChrome.Options();
                            options.addArguments('--headless=new');
                            builder.setChromeOptions(options);
                        }
                        break;
                    case 'edge':
                        builder = new Builder().forBrowser(Browser.EDGE);

                        if (headless) {
                            const options = new microsoftEdge.Options();
                            options.addArguments('--headless=new');
                            builder.setEdgeOptions(options);
                        }
                        break;
                    case 'firefox':
                        builder = new Builder().forBrowser(Browser.FIREFOX);

                        if (headless) {
                            const options = new mozillaFirefox.Options();
                            options.addArguments('--headless');
                            builder.setFirefoxOptions(options);
                        }
                        break;
                    case 'safari':
                        builder = new Builder().forBrowser(Browser.SAFARI);

                        if (headless) {
                            console.warn('Safari driver does not support headless mode.');
                        }
                        break;
                    default:
                        throw Error('unsupported browser'); // TODO: Add more specific error
                }

                const driver = builder.build();

                await driver.manage().setTimeouts({ pageLoad: timeoutSettings.pageLoadTimeout, script: timeoutSettings.scriptTimeout });

                if (shouldStartMaximized) {
                    await driver.manage().window().maximize();
                }

                if (viewport) {
                    await driver.manage().window().setRect({ x: 0, y: 0, ...viewport });
                }

                const webBrowser = new SeleniumBrowserController(driver);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            default:
                throw new Error('unknown driver'); // TODO: Add more specific error
        }
    }

    static async launchRemote(): Promise<BrowserController> {
        const webSettings = BellatrixSettings.get().webSettings;

        const timeoutSettings = webSettings.timeoutSettings;

        const baseUrl = webSettings.executionSettings.baseUrl;
        const viewport = webSettings.executionSettings.viewport;
        const shouldStartMaximized = webSettings.executionSettings.startMaximized;

        switch (webSettings.executionSettings.browserController.toLowerCase()) {
            case 'playwright': {
                let browser;
                if (!webSettings.remoteExecutionSettings) {
                    throw Error('remoteExecutionSettings should be provided under webSettings');
                }

                let gridSessionId: string | undefined;

                switch (webSettings.remoteExecutionSettings.provider) {
                    case 'Selenoid':
                    case 'Selenium Grid':
                        if (!['chrome', 'edge'].includes(webSettings.executionSettings.browser.toLowerCase())) {
                            throw Error('Playwright supports running in Selenium Grid only with Chromium browsers.');
                        }

                        const gridUrl = new URL(webSettings.remoteExecutionSettings.remoteUrl);
                        const response = await new HttpClient(gridUrl).sendRequest<{ value: { sessionId: string, capabilities: { 'se:cdp': string } } }>({
                            path: '/session',
                            method: 'POST',
                            data: {
                                capabilities: {
                                    alwaysMatch: webSettings.remoteExecutionSettings.capabilities,
                                }
                            },
                        });

                        gridSessionId = response.body.value.sessionId;

                        const cdpUrl = new URL(response.body.value.capabilities['se:cdp']);
                        cdpUrl.host = gridUrl.host;

                        process.env.SELENIUM_REMOTE_CAPABILITIES = JSON.stringify(webSettings.remoteExecutionSettings.capabilities);
                        process.env.SELENIUM_REMOTE_HEADERS = JSON.stringify(webSettings.remoteExecutionSettings.headers);

                        browser = await chromium.connectOverCDP(cdpUrl.href);

                        break;
                    case 'LambdaTest': {
                        const capabilities = webSettings.remoteExecutionSettings.capabilities ?? {};
                        capabilities['LT:Options'] = {
                            ...capabilities['LT:Options'] as Record<string, unknown>,
                            user: webSettings.remoteExecutionSettings.username,
                            accessKey: webSettings.remoteExecutionSettings.accessKey,
                        };

                        const supportedBrowsers = ['Chrome', 'MicrosoftEdge', 'pw-chromium', 'pw-firefox', 'pw-webkit'];

                        if (supportedBrowsers.map(b => b.toLowerCase()).includes(webSettings.remoteExecutionSettings.capabilities.browserName.toLowerCase())) {
                            browser = await chromium.connect(`wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`);
                        } else {
                            throw new Error('Unsupported browserName. Playwright cloud execution in BrowserStack supports the following browsers:\n'
                            + supportedBrowsers.map(b => `"${b}"`).join(', '));
                        }

                        break;
                    }
                    case 'BrowserStack': {
                        const capabilities = {
                            ...webSettings.remoteExecutionSettings.capabilities,
                            'browserstack.username': webSettings.remoteExecutionSettings.username,
                            'browserstack.accessKey': webSettings.remoteExecutionSettings.accessKey,
                        };

                        const supportedBrowsers = ['chrome', 'edge', 'playwright-chromium', 'playwright-firefox', 'playwright-webkit'];

                        if (supportedBrowsers.map(b => b.toLowerCase()).includes(webSettings.remoteExecutionSettings.capabilities.browserName.toLowerCase())) {
                            browser = await chromium.connect(`wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(JSON.stringify(capabilities))}`);
                        } else {
                            throw new Error('Unsupported browserName. Playwright cloud execution in BrowserStack supports the following browsers:\n'
                            + supportedBrowsers.map(b => `"${b}"`).join(', '));
                        }

                        break;
                    }
                    default:
                        throw new Error('Unsupported remote execution provider for Playwright in Bellatrix Test Automation Framework.');
                }

                const context = await browser.newContext({ viewport: viewport ?? null });

                const page = await context.newPage();

                const webBrowser = new PlaywrightBrowserController(browser, context, page);
                webBrowser.setGridSessionId(gridSessionId);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            case 'selenium': {
                let driver;
                if (!webSettings.remoteExecutionSettings) {
                    throw Error('remoteExecutionSettings should be provided under webSettings');
                }

                switch (webSettings.remoteExecutionSettings.provider) {
                    case 'Selenium Grid':
                        const gridUrl = new URL(webSettings.remoteExecutionSettings.remoteUrl);
                        driver = new Builder()
                            .usingServer(gridUrl.href)
                            .withCapabilities(webSettings.remoteExecutionSettings.capabilities)
                            .build() as NativeWebDriver;

                        break;
                    case 'LambdaTest': {
                        const gridUrl = new URL('https://hub.lambdatest.com/wd/hub');
                        gridUrl.username = webSettings.remoteExecutionSettings.username;
                        gridUrl.password = webSettings.remoteExecutionSettings.accessKey;
                        driver = new Builder()
                            .usingServer(gridUrl.href)
                            .withCapabilities(webSettings.remoteExecutionSettings.capabilities)
                            .build() as NativeWebDriver;

                        break;
                    }
                    case 'BrowserStack': {
                        const capabilities = webSettings.remoteExecutionSettings.capabilities;
                        capabilities['bstack:options'] = {
                            ...capabilities['bstack:options'] as Record<string, unknown>,
                            userName: webSettings.remoteExecutionSettings.username,
                            accessKey: webSettings.remoteExecutionSettings.accessKey,
                        };

                        const gridUrl = new URL('https://hub-cloud.browserstack.com/wd/hub');
                        driver = new Builder()
                            .usingServer(gridUrl.href)
                            .withCapabilities(capabilities)
                            .build() as NativeWebDriver;

                        break;
                    }
                    default:
                        throw new Error('Unsupported remote execution provider for Selenium in Bellatrix Test Automation Framework.');
                }

                await driver.manage().setTimeouts({ pageLoad: timeoutSettings.pageLoadTimeout, script: timeoutSettings.scriptTimeout });

                if (shouldStartMaximized) {
                    await driver.manage().window().maximize();
                }

                if (viewport) {
                    await driver.manage().window().setRect({ x: 0, y: 0, ...viewport });
                }

                const webBrowser = new SeleniumBrowserController(driver);

                await webBrowser.open(baseUrl);
                return webBrowser;
            }
            default:
                throw new Error(`Unknown browser automation tool: ${webSettings.executionSettings.browserController}`);
        }
    }
}
