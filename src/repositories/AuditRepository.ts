import { BaseRepository } from "./BaseRepository";
import AuditLog from "../model/AduitLog"; 

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    return AuditLog.findAll({ where: { changedBy: userId } });
  }
}