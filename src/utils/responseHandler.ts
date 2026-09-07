import { Response } from "express";
import { mediaFields } from "./media";

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: any;
}

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: any = null,
    error: any = null
) => {
    const response: ApiResponse = {
        success,
        message,
        ...(data && { data: mediaFields(data) }),
        ...(error && { error })
    };
    res.status(statusCode).json(response);
};
