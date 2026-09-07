import { AuditLogRepository } from "../repositories/AuditRepository";
import AuditLog from "../model/AduitLog";

export class AuditService {
    private auditLogRepository: AuditLogRepository;
    constructor() {
        this.auditLogRepository = new AuditLogRepository();
    }

    async createAuditLog(data: Partial<AuditLog>): Promise<AuditLog> {
        return this.auditLogRepository.create(data);
    }

    async getAllAuditLogs(): Promise<AuditLog[]> {
        return this.auditLogRepository.getAll();
    }

    async getAuditLogById(id: number): Promise<AuditLog | null> {
        return this.auditLogRepository.getById(id);
    }

    async updateAuditLog(id: number, data: Partial<AuditLog>): Promise<AuditLog | null> {
        return this.auditLogRepository.update(id, data);
    }

    async deleteAuditLog(id: number): Promise<boolean> {
        return this.auditLogRepository.delete(id);
    }

    // getaudit by user
    async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
        return this.auditLogRepository.getAuditLogsByUser(userId);
    }
}