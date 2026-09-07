import { Request, Response } from "express";
import { sendResponse } from "../../utils/responseHandler";
import { isCar } from "../../utils/validateBody";


// @desc    Get all users
export const getUsers = (req: Request, res: Response) => {
    const users = [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Doe" }];
    sendResponse(res, 200, true, "User fetched successfully", users);
};

export const testUser = (req: Request, res: Response) => {
    const { id } = req.params;
    const body =req.body
    if (id === "1") {
        if (!isCar(body)) {
            return sendResponse(res, 400, false, "Invalid Car data format");
        }
        return sendResponse(res, 200, true, "Car data received successfully", body);
    }

    sendResponse(res, 200, true, "User fetched successfully", JSON.stringify(req.body));
}