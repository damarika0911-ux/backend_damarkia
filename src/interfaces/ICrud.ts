export interface ICrud<T> {
    create(data: Partial<T>): Promise<T>;
    getById(id: number): Promise<T | null>;
    getAll(): Promise<T[]>;
    update(id: number, data: Partial<T>): Promise<T | null>;
    delete(id: number): Promise<boolean>;
  }