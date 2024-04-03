import { HttpMethod } from "@bellatrix/core/types";

export type CommandInfo = {
    method: HttpMethod;
    path: string;
};