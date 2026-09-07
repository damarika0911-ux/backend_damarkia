import { Model, ModelStatic, Op } from "sequelize";
import { ICrud } from "../interfaces/ICrud";

export class BaseRepository<T extends Model> implements ICrud<T> {
  private model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return (await this.model.create(data as any)) as T;
  }

  async getById(id: number): Promise<T | null> {
    return (await this.model.findByPk(id)) as T | null;
  }

  async getAll(): Promise<T[]> {
    return (await this.model.findAll()) as T[];
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const record = await this.model.findByPk(id);
    if (!record) return null;

    await record.update(data as any);
    return record as T;
  }

  async delete(id: number): Promise<boolean> {
        const options = {
          where: {
            [Op.eq]: { id: id }
          }
        };
    const deleted = await this.model.destroy(options);
    return deleted > 0;
  }
}
