import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { promisePool } from "../../../database/connection";
import { sendResponse } from "../../../utils/responseHandler";

export const adminHealthCheck = async (_req: Request, res: Response) => {
  try {
    await promisePool.query("SELECT 1");
    sendResponse(res, 200, true, "Admin Backend Working Good...", "Database Connected success");
  } catch {
    sendResponse(res, 503, false, "Database connection failed");
  }
};

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, role_id } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, "Name, email and password are required");
  }

  try {
    const [existing] = await promisePool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await promisePool.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role_id || 2]
    );

    sendResponse(res, 201, true, "User created successfully", {
      id: result.insertId,
      name,
      email,
      role_id: role_id || 2,
    });
  } catch (error) {
    sendResponse(res, 500, false, "Internal server error", null, error);
  }
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return sendResponse(res, 401, false, "Access denied. No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    (req as any).user = decoded;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, "Invalid token", null, error);
  }
};

