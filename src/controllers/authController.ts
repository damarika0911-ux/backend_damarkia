import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import type { RowDataPacket, ResultSetHeader } from "../types/db";
import { promisePool } from "../database/connection";
import { sendResponse } from "../utils/responseHandler";
import { AuthRequest, credentialVersion } from "../middleware/auth";

// A real bcrypt hash of a random value. Comparing against it when the email is unknown makes
// "no such user" take as long as "wrong password", so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 12);

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (typeof email !== "string" || typeof password !== "string" || !email || !password || email.length > 254 || Buffer.byteLength(password) > 72) {
    return sendResponse(res, 400, false, "Email and password are required");
  }

  try {
    const [users] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.*, r.role_name, r.status AS role_status FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.email = ?",
      [email]
    );

    const user = users.length === 1 ? users[0] : null;
    const isValidPassword = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user) return sendResponse(res, 401, false, "Invalid email or password");

    if (!isValidPassword || !user.status || !user.role_status) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id, version: credentialVersion(user.password) },
      process.env.JWT_SECRET as string,
      { expiresIn: "12h", algorithm: "HS256" }
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
