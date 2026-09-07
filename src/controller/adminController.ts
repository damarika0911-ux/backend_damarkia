import {Request, Response} from "express";
import { AdminService } from "../services/adminSerivce";

const adminService = new AdminService();

export class AdminController {
    static async createUser(req: Request, res: Response) {
        const data = req.body;
        const user = await adminService.createUser(data);
        res.status(201).json(user);
    }

    static async getAllUsers(req: Request, res: Response) {
        const users = await adminService.getAllUsers();
        res.json(users);
    }

    static async getAllAdmins(req: Request, res: Response) {
        const admins = await adminService.getAllAdmins();
        res.json(admins);
    }

}