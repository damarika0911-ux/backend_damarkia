import { Response } from "express";
import { mediaFields } from "./media";
import logger from "./logger";

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}

/** Thrown for bad input; controllers turn it into a 400 with this message. */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

const GENERIC_ERROR = "Something went wrong on our side. Please try again.";

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: any = null,
    error: any = null
) => {
    // Never send internal error text (SQL, stack, file paths) to the client. Log it instead.
    if (statusCode === 500) {
        logger.error(`${res.req?.method} ${res.req?.originalUrl} -> ${statusCode}: ${message}`);
        message = GENERIC_ERROR;
        error = null;
    }
    const response: ApiResponse = {
        success,
        message,
        ...(data && { data: mediaFields(data) }),
        ...(error && { error })
    };
    res.status(statusCode).json(response);
};

/** Use in catch blocks: bad input becomes 400 with its message, anything else a generic 500. */
export const sendError = (res: Response, error: unknown) =>
    error instanceof ValidationError
        ? sendResponse(res, 400, false, error.message)
        : sendResponse(res, 500, false, error instanceof Error ? error.message : String(error));
