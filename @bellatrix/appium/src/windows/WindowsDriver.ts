import { ubyte } from '@bellatrix/appium/types';
import { AppiumDriver } from '@bellatrix/appium/core';
import { WindowsCommands } from '@bellatrix/appium/windows';


type CreatedSessionResponse = {
    capabilities: object;
    sessionId: string;
}

/**
 * Represents an action related to key input.
 */
type KeyAction = {
    /**
     * Allows setting a delay in milliseconds between key input series.
     * Either this property or text or virtualKeyCode must be provided.
     */
    pause: number;
    text?: never;
    virtualKeyCode?: never;
    down?: never;
} | {

    /**
     * Non-empty string of Unicode text to type.
     * Either this property or pause or virtualKeyCode must be provided.
     */
    text: string;
    pause?: never;
    virtualKeyCode?: never;
    down?: never;
} | {
    /**
     * Valid virtual key code. The list of supported key codes is available in the VirtualKeyCode class.
     * Either this property or pause or text must be provided.
     */
    virtualKeyCode: ubyte;
  
    /**
     * This property only makes sense in combination with virtualKeyCode.
     * If set to true, then the corresponding key will be depressed.
     * By default, the key is just pressed once.
     * ! Do not forget to release depressed keys in your automated tests.
     */
    down?: boolean;
    text?: never;
    pause?: never;
};

type ModifierKey = 'shift' | 'ctrl' | 'alt' | 'win'

type MouseButton = 'left' | 'right' | 'middle' | 'back' | 'forward'

export class WindowsDriver extends AppiumDriver {
    private static readonly WINDOWS_PLATOFRM = 'Windows';

    constructor(serverUrl: string, capabilities: object) {
        super(serverUrl, AppiumDriver.validatePlatformName(capabilities, WindowsDriver.WINDOWS_PLATOFRM));
    }

    async execute<T>(script: string, args: object = {}): Promise<T> {
        return this.commandExecutor.execute(WindowsCommands.EXECUTE_SCRIPT, { script, args }) as T;
    }

    async createSession(): Promise<void> {
        const response = await this.commandExecutor.execute<CreatedSessionResponse>(WindowsCommands.CREATE_SESSION, { capabilities: { alwaysMatch: this.capabilities } });
        this.commandExecutor.setSessionId(response.sessionId);
    }

    async deleteSession(): Promise<void> {
        await this.commandExecutor.execute(WindowsCommands.DELETE_SESSION)
        this.commandExecutor.unsetSessionId();
    }

    async getClipboard(): Promise<string> {
        const response = await this.execute<string>('windows: getClipboard', {
            contentType: 'plaintext',
        });

        return atob(response)
    }

    async click(x: number, y: number, ): Promise<void> {
        this.execute<string>('windows: click', {
            x,
            y,
            button: 'left',
        });
    }

    async rightClick(x: number, y: number,  modifierKeys: ModifierKey[] | ModifierKey | null = null): Promise<void> {
        this.execute<string>('windows: click', {
            x,
            y,
            button: 'right',
        });
    }

    async sendKeys(actions: KeyAction | KeyAction[]): Promise<void>
    async sendKeys(text: string): Promise<void>
    async sendKeys(actionsOrText: KeyAction | KeyAction[] | string): Promise<void> {
        if (typeof(actionsOrText) == 'string') {
            const text = actionsOrText;
            this.execute('windows: keys', { actions: { text } });
            return;
        }

        const actions = actionsOrText;
        this.execute('windows: keys', { actions });
    }

    async setClipboard(content: string) {
        this.execute('windows: setClipboard', {
            b64Content: btoa(content),
            contentType: 'plaintext',
        });
    }
}