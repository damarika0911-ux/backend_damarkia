import { ProductCategoryRepository } from "../repositories/ProductCategoryRepository";
import ProductCategory from "../model/ProductCategory";

export class ProductCategoryService {
    private productCategoryRepository: ProductCategoryRepository;

    constructor() {
      this.productCategoryRepository = new ProductCategoryRepository();
    }

    async createProductCategory(data: Partial<ProductCategory>): Promise<ProductCategory> {
      return this.productCategoryRepository.create(data);
    }

    async getAllProductCategories(): Promise<ProductCategory[]> {
      return this.productCategoryRepository.getAll();
    }

    async getProductCategoryById(id: number): Promise<ProductCategory | null> {
      return this.productCategoryRepository.getById(id);
    }

    async updateProductCategory(id: number, data: Partial<ProductCategory>): Promise<ProductCategory | null> {
      return this.productCategoryRepository.update(id, data);
    }

    async deleteProductCategory(id: number): Promise<boolean> {
      return this.productCategoryRepository.delete(id);
    }
}