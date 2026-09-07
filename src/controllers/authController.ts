import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { promisePool } from "../database/connection";
import { sendResponse } from "../utils/responseHandler";
import { AuthRequest, credentialVersion } from "../middleware/auth";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return sendResponse(res, 400, false, "Email and password are required");
  }

  try {
    const [users] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.*, r.role_name, r.status AS role_status FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?",
      [email]
    );

    if (users.length !== 1) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword || !user.status || !user.role_status) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, version: credentialVersion(user.password) },
      process.env.JWT_SECRET || "",
      { expiresIn: "24h" }
    );

    const { password: _, last_token: _token, ...userWithoutPassword } = user;

    sendResponse(res, 200, true, "Login successful", {
      accessToken: token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Internal server error");
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber, role_id, image } = req.body;

  if (!name || !email || !password) {
    return sendResponse(res, 400, false, "Name, email and password are required");
  }

  try {
    const [existing] = await promisePool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return sendResponse(res, 400, false, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await promisePool.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password, phoneNumber, role_id, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phoneNumber || null, role_id || 2, image ? JSON.stringify(image) : null]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role_id: role_id || 2 },
      process.env.JWT_SECRET || "",
      { expiresIn: "24h" }
    );

    sendResponse(res, 201, true, "User registered successfully", {
      accessToken: token,
      user: { id: result.insertId, name, email, role_id: role_id || 2 },
    });
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Internal server error");
  }
};

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const [roles] = await promisePool.query<RowDataPacket[]>(
      "SELECT * FROM roles WHERE status = true ORDER BY id ASC"
    );
    sendResponse(res, 200, true, "Roles fetched successfully", roles);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Internal server error");
  }
};

export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const [users] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.id, u.name, u.email, u.phoneNumber, u.role_id, u.image, u.status, u.user_verify, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [req.user?.id]
    );

    if (users.length === 0) {
      return sendResponse(res, 404, false, "User not found");
    }

    sendResponse(res, 200, true, "User details fetched", users[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Internal server error");
  }
};
