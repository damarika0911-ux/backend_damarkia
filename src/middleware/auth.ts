import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { promisePool } from "../database/connection";
import { sendResponse } from "../utils/responseHandler";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role_id: number; role_name?: string };
}

export const credentialVersion = (hash: string) => crypto.createHash("sha256").update(hash).digest("hex");
export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return sendResponse(res, 401, false, "Sign in to continue");
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET || "", { algorithms: ["HS256"] }) as jwt.JwtPayload;
    if (!decoded.id) throw new Error("Invalid token");
  } catch { return sendResponse(res, 401, false, "Invalid or expired session"); }
  try {
    const [users] = await promisePool.query<any[]>(
      "SELECT u.id,u.email,u.password,u.role_id,u.status,r.role_name,r.status AS role_status,r.view_access,r.create_access,r.edit_access,r.delete_access FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=?", [decoded.id]
    );
    const user = users[0];
    if (!user || !user.status || !user.role_status || decoded.version !== credentialVersion(user.password)) return sendResponse(res, 401, false, "Account disabled or session expired");
    req.user = { id: user.id, email: user.email, role_id: user.role_id, role_name: user.role_name };
    const ownDetails = req.path === "/v1/userdetails";
    const managesAccess = /^\/v1\/(admin|user|role)(\/|$)/.test(req.path);
    const permission = ({ GET: "view_access", POST: "create_access", PUT: "edit_access", DELETE: "delete_access" } as Record<string, string>)[req.method];
    if (!ownDetails && user.role_name !== "admin" && (managesAccess || !permission || !user[permission])) return sendResponse(res, 403, false, "Your role does not allow this action");
    next();
  } catch (error) { next(error); }
};
