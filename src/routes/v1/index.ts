import { Router } from "express";
import { auth, AuthRequest } from "../../middleware/auth";
import { createCrudController } from "../../controllers/crudFactory";
import {
  login,
  register,
  getRoles,
  getUserDetails,
} from "../../controllers/authController";
import { promisePool } from "../../database/connection";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { sendResponse } from "../../utils/responseHandler";
import bcrypt from "bcryptjs";
import { Response } from "express";
import { rateLimit } from "express-rate-limit";
import { sendContactReply } from "../../services/mailService";

const router = Router();

// ─── Auth Routes (no auth required) ────────────────────────────────
router.post("/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }), login);
router.post("/auth/register", (_req, res) => sendResponse(res, 403, false, "Ask an administrator to create your account"));
router.get("/auth/roles", auth, getRoles);

// ─── User Details (auth required) ──────────────────────────────────
router.get("/v1/userdetails", auth, getUserDetails);

// ─── Admin/User Management ─────────────────────────────────────────
const userCrud = createCrudController("users");

router.get("/v1/admin/admins", auth, async (_req, res) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.id, u.name, u.email, u.phoneNumber, u.role_id, u.image, u.status, u.user_verify, u.createdAt, u.updatedAt, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id ORDER BY u.id DESC"
    );
    sendResponse(res, 200, true, "Users fetched successfully", rows);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.post("/v1/user", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phoneNumber, role_id, image, status } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 12 || Buffer.byteLength(password) > 72 || !role_id) {
      return sendResponse(res, 400, false, "Name, valid email, role and password of 12 characters or more are required");
    }
    const [roles] = await promisePool.query<RowDataPacket[]>("SELECT id FROM roles WHERE id=? AND status=1", [role_id]);
    if (!roles.length) return sendResponse(res, 400, false, "Select an active role");
    const hashedPassword = await bcrypt.hash(password, 12);
    const [duplicates] = await promisePool.query<RowDataPacket[]>("SELECT id FROM users WHERE email=?", [email]);
    if (duplicates.length) return sendResponse(res, 409, false, "This email is already in use");
    const [result] = await promisePool.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password, phoneNumber, role_id, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phoneNumber || null, role_id, typeof image === "object" ? image?.url || null : image || null, status ?? true]
    );
    const [created] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.id,u.name,u.email,u.phoneNumber,u.role_id,u.image,u.status,u.user_verify,r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [result.insertId]
    );
    sendResponse(res, 201, true, "User created successfully", created[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.put("/v1/admin/:id", auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, role_id, image, status, user_verify } = req.body;
    const [duplicates] = await promisePool.query<RowDataPacket[]>("SELECT id FROM users WHERE email=? AND id<>?", [email || "", id]);
    if (duplicates.length) return sendResponse(res, 409, false, "This email is already in use");
    if (!name || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !role_id) return sendResponse(res, 400, false, "Name, email and role are required");
    const [roles] = await promisePool.query<RowDataPacket[]>("SELECT id,role_name FROM roles WHERE id=? AND status=1", [role_id]);
    if (!roles.length) return sendResponse(res, 400, false, "Select an active role");
    if (Number(id) === req.user?.id && (status === false || status === 0 || roles[0].role_name !== "admin")) return sendResponse(res, 400, false, "You cannot disable or demote your own administrator account");
    if (req.body.password && (typeof req.body.password !== "string" || req.body.password.length < 12 || Buffer.byteLength(req.body.password) > 72)) return sendResponse(res, 400, false, "Password must be at least 12 characters and at most 72 UTF-8 bytes");
    await promisePool.query(
      "UPDATE users SET name=?, email=?, phoneNumber=?, role_id=?, image=?, status=?, user_verify=? WHERE id=?",
      [name, email, phoneNumber || null, role_id, typeof image === "object" ? image?.url || null : image || null, status ?? true, user_verify || "not verified", id]
    );
    if (req.body.password) await promisePool.query("UPDATE users SET password=?,last_token=NULL WHERE id=?", [await bcrypt.hash(req.body.password, 12), id]);
    const [updated] = await promisePool.query<RowDataPacket[]>(
      "SELECT u.id,u.name,u.email,u.phoneNumber,u.role_id,u.image,u.status,u.user_verify,r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = ?",
      [id]
    );
    sendResponse(res, 200, true, "User updated successfully", updated[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

router.delete("/v1/admin/:id", auth, (req: AuthRequest, res) => {
  if (Number(req.params.id) === req.user?.id) return sendResponse(res, 400, false, "You cannot delete your own administrator account");
  return userCrud.remove(req, res);
});

// ─── Products ──────────────────────────────────────────────────────
const productCrud = createCrudController("products");
router.get("/v1/product", auth, productCrud.getAll);
router.post("/v1/product", auth, productCrud.create);
router.put("/v1/product/:id", auth, productCrud.update);
router.delete("/v1/product/:id", auth, productCrud.remove);

// ─── Product Categories ────────────────────────────────────────────
const categoryCrud = createCrudController("product_categories");
router.get("/v1/product-category", auth, categoryCrud.getAll);
router.post("/v1/product-category", auth, categoryCrud.create);
router.put("/v1/product-category/:id", auth, categoryCrud.update);
router.delete("/v1/product-category/:id", auth, categoryCrud.remove);

// ─── Roles ─────────────────────────────────────────────────────────
const roleCrud = createCrudController("roles");
router.get("/v1/role", auth, roleCrud.getAll);
router.post("/v1/role", auth, roleCrud.create);
router.put("/v1/role/:id", auth, roleCrud.update);
router.delete("/v1/role/:id", auth, roleCrud.remove);
router.get("/v1/role/:id", auth, roleCrud.getById);

router.get("/v1/role/name/:name", auth, async (req, res) => {
  try {
    const [rows] = await promisePool.query<RowDataPacket[]>(
      "SELECT * FROM roles WHERE role_name = ?",
      [req.params.name]
    );
    if (rows.length === 0) return sendResponse(res, 404, false, "Role not found");
    sendResponse(res, 200, true, "Role fetched successfully", rows[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

// ─── Programs ──────────────────────────────────────────────────────
const programCrud = createCrudController("program");
router.get("/v1/program", auth, programCrud.getAll);
router.post("/v1/program", auth, programCrud.create);
router.put("/v1/program/:id", auth, programCrud.update);
router.delete("/v1/program/:id", auth, programCrud.remove);

// ─── People ────────────────────────────────────────────────────────
const peopleCrud = createCrudController("peoples");
router.get("/v1/people", auth, peopleCrud.getAll);
router.post("/v1/people", auth, peopleCrud.create);
router.put("/v1/people/:id", auth, peopleCrud.update);
router.delete("/v1/people/:id", auth, peopleCrud.remove);

// ─── Districts ─────────────────────────────────────────────────────
const districtCrud = createCrudController("district");
router.get("/v1/district", auth, districtCrud.getAll);
router.post("/v1/district", auth, districtCrud.create);
router.put("/v1/district/:id", auth, districtCrud.update);
router.delete("/v1/district/:id", auth, districtCrud.remove);

// ─── Archaeological Sites ──────────────────────────────────────────
const archaeologicalCrud = createCrudController("archaeological_sites");
router.get("/v1/archeologist", auth, archaeologicalCrud.getAll);
router.post("/v1/archeologist", auth, archaeologicalCrud.create);
router.put("/v1/archeologist/:id", auth, archaeologicalCrud.update);
router.delete("/v1/archeologist/:id", auth, archaeologicalCrud.remove);

// ─── Contact ───────────────────────────────────────────────────────
const contactCrud = createCrudController("contact_form");
router.get("/v1/contact", auth, contactCrud.getAll);
router.post("/v1/contact", auth, contactCrud.create);
router.put("/v1/contact/:id", auth, contactCrud.update);
router.delete("/v1/contact/:id", auth, contactCrud.remove);

router.put("/v1/contact/reply/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    if (typeof reply !== "string" || !reply.trim() || reply.length > 20000) return sendResponse(res, 400, false, "Enter a reply of up to 20,000 characters");
    const [contacts] = await promisePool.query<RowDataPacket[]>("SELECT * FROM contact_form WHERE id=?", [id]);
    if (!contacts.length) return sendResponse(res, 404, false, "Contact not found");
    if (contacts[0].isReplied) return sendResponse(res, 409, false, "This message already has a reply");
    // Legacy rows used reciever_email for the visitor's address.
    const contactEmail = process.env.CONTACT_EMAIL || "support@damarika.in";
    const recipient = contacts[0].sender_email && contacts[0].sender_email !== contactEmail ? contacts[0].sender_email : contacts[0].reciever_email;
    await sendContactReply(recipient, contacts[0].subject, reply);
    await promisePool.query(
      "UPDATE contact_form SET repliedMessage=?, isReplied=true, replyDate=NOW() WHERE id=?",
      [reply, id]
    );
    const [updated] = await promisePool.query<RowDataPacket[]>(
      "SELECT * FROM contact_form WHERE id = ?",
      [id]
    );
    sendResponse(res, 200, true, "Reply accepted by the email server", updated[0]);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
});

export default router;
