import { UserRepository } from "../repositories/UserRepository";
import User from "../model/User";

export class UserService {
    private userRepository: UserRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    
    async getUserById(id: number): Promise<User | null> {
        return this.userRepository.getById(id);
    }
}