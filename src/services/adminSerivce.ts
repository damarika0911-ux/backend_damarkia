import { UserRepository } from "../repositories/UserRepository";
import Users from "../model/User";

export class AdminService {
    private userRepository: UserRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }

    async createUser(data: Partial<Users>): Promise<Users> {
        return this.userRepository.create(data);
    }

    async getAllUsers(): Promise<Users[]> {
        return this.userRepository.getAll();
    }

    async getAllAdmins(): Promise<Users[]> {
        return this.userRepository.getAllAdmins();
    }

    async getUserById(id: number): Promise<Users | null> {
        return this.userRepository.getById(id);
    }

    async updateUser(id: number, data: Partial<Users>): Promise<Users | null> {
        return this.userRepository.update(id, data);
    }

    async deleteUser(id: number): Promise<boolean> {
        return this.userRepository.delete(id);
    }

    
};