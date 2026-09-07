import { BaseRepository } from "./BaseRepository";
import User from "../model/User";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  async getAllUsers(): Promise<User[]> {
    return await User.findAll({
      where: { role: "user" },
    });
  }

  async getAllAdmins(): Promise<User[]> {
    return await User.findAll({
      where: { role: "admin" },
    });
  }
}
