import { Image } from '@bellatrix/core/image';
import { AndroidPermission } from '@bellatrix/appium/types';
import { AppiumDriver } from '@bellatrix/appium/core';
import { MobileCommands } from '@bellatrix/appium/common/commands';

type CreatedSessionResponse = {
    capabilities: Record<string, unknown>;
    sessionId: string;
}

type AndroidBatteryInfo = {
    percentage: number;
    state: BatteryState;
}

type BatteryState = 'Unknown' | 'Charging' | 'Discharging' | 'Not charging' | 'Full';

type EditorAction = 'normal' | 'unspecified' | 'none' | 'go' | 'search' | 'send' | 'next' | 'done' | 'previous';

type PermissionType = 'denied' | 'granted' | 'requested';

type SMSListResponse = {
    items: SMS[];
    total: number;
}

type SMS = {
    id: string;
    address: string;
    person: string | null;
    date: string;
    read: string;
    status: string;
    type: string;
    subject: string | null;
    body: string;
    serviceCenter: string | null;
}

export class AndroidDriver extends AppiumDriver {
    private static readonly ANDROID_PLATOFRM = 'Android';

    constructor(serverUrl: string, capabilities: Record<string, unknown>) {
        super(serverUrl, AppiumDriver.validatePlatformName(capabilities, AndroidDriver.ANDROID_PLATOFRM));
    }

    async createSession(): Promise<void> {
        const response = await this.commandExecutor.execute<CreatedSessionResponse>(MobileCommands.CREATE_SESSION, { capabilities: { alwaysMatch: this.capabilities } });
        await this.commandExecutor.setSessionId(response.sessionId);
    }

    async deleteSession(): Promise<void> {
        const response = await this.commandExecutor.execute(MobileCommands.DELETE_SESSION);
        await this.commandExecutor.unsetSessionId();
    }

    async getContexts(): Promise<string[]> {
        return await this.commandExecutor.execute(MobileCommands.GET_CONTEXTS);
    }

    async getCurrentContext(): Promise<string> {
        return await this.commandExecutor.execute(MobileCommands.GET_CURRENT_CONTEXT);
    }

    async setContext(name: string): Promise<void> {
        await this.commandExecutor.execute(MobileCommands.SET_CONTEXT, { name });
    }

    async openNotifications(): Promise<void> {
        await this.commandExecutor.execute(MobileCommands.OPEN_NOTIFICATIONS);
    }

    async closeNotifications(): Promise<void> {
        await this.executeADBShellCommand('service call statusbar 2');
    }

    async toggleLocationServices(): Promise<void> {
        await this.commandExecutor.execute(MobileCommands.TOGGLE_LOCATION_SERVICES);
    }

    async getBatteryInfo(): Promise<AndroidBatteryInfo> {
        const response: { level: number; state: number } = await this.execute('mobile: batteryInfo');
        const percentage = response.level * 100;

        const stateMap: Record<number, BatteryState> = {
            2: 'Charging',
            3: 'Discharging',
            4: 'Not charging',
            5: 'Full',
        };

        const state: BatteryState = stateMap[response.state] || 'Unknown';

        return { percentage, state };
    }

    async execute<T>(script: string, args: object = {}): Promise<T> {
        return await this.commandExecutor.execute(MobileCommands.EXECUTE_SCRIPT, { script, args }) as T;
    }

    async executeADBShellCommand<T>(command: string, includeStderr?: boolean, timeout?: number): Promise<T>;
    async executeADBShellCommand<T>(command: string, timeout?: number): Promise<T>;
    async executeADBShellCommand<T>(command: string, includeStderrOrTimeout?: boolean | number, timeout?: number): Promise<T> {
        let includeStderr: boolean | undefined;
        if (typeof includeStderrOrTimeout === 'boolean') {
            includeStderr = includeStderrOrTimeout;
        } else {
            timeout = includeStderrOrTimeout;
        }

        const tokens = command.split(/\s+/);
        return this.execute('mobile: shell', { command: tokens[0], args: tokens.slice(1), includeStderr, timeout });
    }

    async performEditorAction(action: EditorAction) {
        return this.execute('mobile: performEditorAction', { action });
    }

    async getPermissions(type?: PermissionType, appPackage?: string): Promise<AndroidPermission[]> {
        return (await this.execute<string[]>('mobile: getPermissions', { type, appPackage }))
            .map(permission => permission.replace('android.permission.', '')) as AndroidPermission[];
    }

    async grantPermissions(...permissions: AndroidPermission[]): Promise<void> {
        return this.execute('mobile: changePermissions', {
            action: 'grant', permissions: permissions
                .map(permission => `android.permission.${permission}`)
        });
    }

    async revokePermission(...permissions: AndroidPermission[]): Promise<void> {
        return this.execute('mobile: changePermissions', {
            action: 'revoke', permissions: permissions
                .map(permission => `android.permission.${permission}`)
        });
    }

    async takeScreenshot(): Promise<Image> {
        const base64image = await this.commandExecutor.execute<Promise<string>>(MobileCommands.SCREENSHOT);
        return Image.fromBase64(base64image);
    }

    async getElementScreenshot(elementId: string) { // WIP:temp
        this.commandExecutor.setParam('elementId', elementId);
        const base64image = await this.commandExecutor.execute<Promise<string>>(MobileCommands.ELEMENT_SCREENSHOT);
        return base64image;
    }

    async getActiveElement() { // WIP
        return await this.commandExecutor.execute(MobileCommands.GET_ACTIVE_ELEMENT);
    }

    async listSMS(): Promise<SMSListResponse> {
        return this.execute('mobile: listSms');
    }

    async startRecordingScreen(): Promise<void> {
        return await this.commandExecutor.execute(MobileCommands.START_RECORDING_SCREEN);
    }

    async stopRecordingScreen() { // WIP
        const base64video = await this.commandExecutor.execute(MobileCommands.STOP_RECORDING_SCREEN);
        return base64video;
    }
}
