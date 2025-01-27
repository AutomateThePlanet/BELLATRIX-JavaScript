export interface HttpCommandExecutor {
    execute<T>(command: string, data?: object): Promise<T>;
    setSessionId(sessionId: string): void;
    unsetSessionId(): void;
    setParam(name: string, value: string): void;
}
