import { CommandInfo } from "@bellatrix/appium/types";
import { CommandRepository } from "@bellatrix/appium/core/contracts";

export class WindowsCommands {
    static readonly CREATE_SESSION = 'createSession';
    static readonly DELETE_SESSION = 'deleteSession';
    static readonly GET_CONTEXTS = 'getContexts';
    static readonly GET_CURRENT_CONTEXT = 'getCurrentContext';
    static readonly SET_CONTEXT = 'setContext';
    static readonly EXECUTE_SCRIPT = 'executeScript';
    static readonly IMPLICIT_WAIT = 'implicitWait';
    static readonly GET_ACTIVE_ELEMENT = 'getActiveElement'

    public static commandRepository: CommandRepository = new Map([
        [this.CREATE_SESSION, this.postCommand('/session')],
        [this.DELETE_SESSION, this.deleteCommand('/session/:sessionId')],
        [this.GET_CONTEXTS, this.getCommand('/session/:sessionId/contexts')],
        [this.GET_CURRENT_CONTEXT, this.getCommand('/session/:sessionId/context')],
        [this.SET_CONTEXT, this.postCommand('/session/:sessionId/context')],
        [this.EXECUTE_SCRIPT, this.postCommand('/session/:sessionId/execute')],
        [this.IMPLICIT_WAIT, this.postCommand('/session/:sessionId/timeouts/implicit_wait')],
        [this.GET_ACTIVE_ELEMENT, this.getCommand('/session/:sessionId/element/active')],
    ]);

    private static postCommand(path: string): CommandInfo {
        return { method: 'POST', path };
    }

    private static getCommand(path: string): CommandInfo {
        return { method: 'GET', path };
    }

    private static deleteCommand(path: string): CommandInfo {
        return { method: 'DELETE', path };
    }
}