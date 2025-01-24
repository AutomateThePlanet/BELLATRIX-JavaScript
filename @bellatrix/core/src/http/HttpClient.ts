import * as http from 'http';

import type { HttpMethod } from '@bellatrix/core/types';

type Request = {
    path: string,
    method: HttpMethod,
    data?: object,
};

type Response<T> = {
    status: number,
    body: T,
};

export class HttpClient {
    private serverUrl: URL;

    constructor(serverUrl: URL) {
        this.serverUrl = serverUrl;
    }

    sendRequest<Т>(request: Request): Promise<Response<Т>> {
        return new Promise((resolve, reject) => {
            const options: http.RequestOptions = {
                hostname: this.serverUrl.hostname,
                port: this.serverUrl.port,
                path: request.path,
                method: request.method,
                headers: {
                    'Accept': 'application/json; charset=utf-8'
                }
            };

            const req = http.request(options, res => {
                res.setEncoding('utf8');
                let data = '';
                res.on('data', chunk => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        body: JSON.parse(data)
                    } as Response<Т>);
                });
            });

            req.on('error', error => {
                reject(error);
            });

            if (request.data) {
                req.write(JSON.stringify(request.data));
            }

            req.end();
        });
    }
}
