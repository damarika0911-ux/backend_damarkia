import { Request, Response } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { promisePool } from "../database/connection";
import { sendResponse } from "../utils/responseHandler";
import { writableFields, crudData } from "./crudFields";
import { AuthRequest } from "../middleware/auth";

export function createCrudController(tableName: string) {
  if (!writableFields[tableName]) throw new Error("Unsupported resource");
  return {
    getAll: async (_req: Request, res: Response) => {
      try {
        const [rows] = await promisePool.query<RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\` ORDER BY id DESC`
        );
        sendResponse(res, 200, true, `${tableName} fetched successfully`, rows);
      } catch (error: any) {
        sendResponse(res, 500, false, error.message || "Internal server error");
      }
    },

    getById: async (req: Request, res: Response) => {
      try {
        const [rows] = await promisePool.query<RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\` WHERE id = ?`,
          [req.params.id]
        );
        if (rows.length === 0) {
          return sendResponse(res, 404, false, "Record not found");
        }
        sendResponse(res, 200, true, `${tableName} fetched successfully`, rows[0]);
      } catch (error: any) {
        sendResponse(res, 500, false, error.message || "Internal server error");
      }
    },

    create: async (req: Request, res: Response) => {
      try {
        const data = crudData(tableName, req.body);
        if (!Object.keys(data).length) return sendResponse(res, 400, false, "No editable fields provided");
        if (tableName !== "roles") {
          data[tableName === "program" ? "createdBy" : "created_by"] = (req as AuthRequest).user?.id;
          data[tableName === "program" ? "updatedBy" : "updated_by"] = (req as AuthRequest).user?.id;
        }
        // Strip id if null/undefined (let DB auto-increment)
        if (data.id === null || data.id === undefined) delete data.id;

        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => "?").join(", ");
        const columns = keys.map((k) => `\`${k}\``).join(", ");

        const [result] = await promisePool.query<ResultSetHeader>(
          `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`,
          values
        );

        const [created] = await promisePool.query<RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\` WHERE id = ?`,
          [result.insertId]
        );

        sendResponse(res, 201, true, `${tableName} created successfully`, created[0]);
      } catch (error: any) {
        sendResponse(res, 500, false, error.message || "Internal server error");
      }
    },

    update: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const data = crudData(tableName, req.body);
        if (!Object.keys(data).length) return sendResponse(res, 400, false, "No editable fields provided");
        if (tableName === "roles") {
          const [roles] = await promisePool.query<RowDataPacket[]>("SELECT role_name FROM roles WHERE id=?", [id]);
          if (roles[0]?.role_name === "admin") return sendResponse(res, 400, false, "The administrator role is protected");
        } else data[tableName === "program" ? "updatedBy" : "updated_by"] = (req as AuthRequest).user?.id;
        delete data.id; // Don't update the ID field
        delete data.createdAt; // Don't overwrite timestamps
        delete data.updatedAt;

        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((k) => `\`${k}\` = ?`).join(", ");

        await promisePool.query<ResultSetHeader>(
          `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`,
          [...values, id]
        );

        const [updated] = await promisePool.query<RowDataPacket[]>(
          `SELECT * FROM \`${tableName}\` WHERE id = ?`,
          [id]
        );

        if (updated.length === 0) {
          return sendResponse(res, 404, false, "Record not found");
        }
        sendResponse(res, 200, true, `${tableName} updated successfully`, updated[0]);
      } catch (error: any) {
        sendResponse(res, 500, false, error.message || "Internal server error");
      }
    },

    remove: async (req: Request, res: Response) => {
      try {
        const references: Record<string, [string, string][]> = {
          roles: [["users", "role_id"], ["peoples", "role_id"]],
          product_categories: [["products", "categoryId"]],
          district: [["archaeological_sites", "districtId"]],
        };
        if (tableName === "roles") {
          const [roles] = await promisePool.query<RowDataPacket[]>("SELECT role_name FROM roles WHERE id=?", [req.params.id]);
          if (roles[0]?.role_name === "admin") return sendResponse(res, 400, false, "The administrator role is protected");
        }
        for (const [table, column] of references[tableName] || []) {
          const [rows] = await promisePool.query<RowDataPacket[]>(`SELECT id FROM \`${table}\` WHERE \`${column}\`=? LIMIT 1`, [req.params.id]);
          if (rows.length) return sendResponse(res, 409, false, "This record is still in use. Reassign its related records first.");
        }
        const [result] = await promisePool.query<ResultSetHeader>(
          `DELETE FROM \`${tableName}\` WHERE id = ?`,
          [req.params.id]
        );
        if (result.affectedRows === 0) {
          return sendResponse(res, 404, false, "Record not found");
        }
        sendResponse(res, 200, true, `${tableName} deleted successfully`);
      } catch (error: any) {
        sendResponse(res, 500, false, error.message || "Internal server error");
      }
    },
  };
}
