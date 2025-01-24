import { HttpCommandExecutor, CommandRepository } from '@bellatrix/appium/core/contracts';
import { HttpClient } from '@bellatrix/core/http';

type AppiumResponse<T> = {
    value: T;
}

type AppiumError = {
    error: string;
    message: string;
    stacktrace: string;
}

export class AppiumCommandExecutor implements HttpCommandExecutor {
    private httpClient: HttpClient;
    private commandRespository: CommandRepository;
    private pathParams: Map<string, string>;

    constructor(commandRepository: CommandRepository, httpClient: HttpClient) {
        this.httpClient = httpClient;
        this.commandRespository = commandRepository;
        this.pathParams = new Map();
    }

    async execute<T>(command: string, data?: object): Promise<T> {
        const commandInfo = this.commandRespository.get(command);

        if (!commandInfo) {
            throw Error('Invalid command.');
        }

        const response = await this.httpClient.sendRequest<AppiumResponse<T>>({
            path: this.replacePathParameters(commandInfo.path),
            method: commandInfo.method,
            data,
        });

        if ((response.body.value as AppiumError)?.error) {
            const appiumError = response.body.value as AppiumError;
            throw Error(appiumError.stacktrace);
        }

        return response.body.value;
    }

    setSessionId(sessionId: string) {
        if (this.pathParams.has('sessionId')) {
            throw Error('Session ID is already set.');
        }

        this.pathParams.set('sessionId', sessionId);
    }

    unsetSessionId() {
        if (!this.pathParams.has('sessionId')) {
            throw Error('No session ID to delete.');
        }

        this.pathParams.delete('sessionId');
    }

    setParam(name: string, value: string) {
        if (name === 'sessionId') {
            throw Error('Use setSessionId to set Session ID.');
        }

        this.pathParams.set(name, value);
    }

    private replacePathParameters(path: string): string {
        return path.replace(/:(\w+)/g, (_, param) => {
            const variableValue = this.pathParams.get(param);
            if (variableValue === undefined) {
                throw new Error(`Parameter ${param} does not exist in variables.`);
            }

            return variableValue;
        });
    }
}
