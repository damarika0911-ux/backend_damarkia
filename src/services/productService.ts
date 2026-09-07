import { ProductRepository } from "../repositories/ProductRepository";
import Product from "../model/Product";

export class ProductService {
    private productRepository: ProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    async createProduct(data: Partial<Product>): Promise<Product> {
        return this.productRepository.create(data);
    }

    async getAllProducts(): Promise<Product[]> {
        return this.productRepository.getAll();
    }

    async getProductById(id: number): Promise<Product | null> {
        return this.productRepository.getById(id);
    }

    async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
        return this.productRepository.update(id, data);
    }

    async deleteProduct(id: number): Promise<boolean> {
        return this.productRepository.delete(id);
    }

}