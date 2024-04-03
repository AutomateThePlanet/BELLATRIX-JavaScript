import { AndroidDriver } from "@bellatrix/appium/android";

const capabilities = {
    platformName: 'Android',
    'appium:avd': 'android34',
    'appium:app': '/Users/Teodor/Downloads/ApiDemos-debug.apk',
    'appium:noReset': false,
    'appium:automationName': 'UiAutomator2'
};

const driver = new AndroidDriver('http://127.0.0.1:4723/', capabilities);

async function myTest() {
    await driver.createSession();
    await driver.getBatteryInfo().then(console.log);
    await driver.deleteSession();
}

myTest();


