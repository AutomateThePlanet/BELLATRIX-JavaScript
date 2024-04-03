import { WindowsDriver } from "./windows/WindowsDriver";

const capabilities = {
    platformName: 'Windows',
    'appium:automationName': 'Windows',
    'appium:app': 'Root',
};

const driver = new WindowsDriver('http://172.27.80.1:4723/', capabilities);

async function myTest() {
    await driver.createSession();
    await driver.deleteSession();
}

myTest();