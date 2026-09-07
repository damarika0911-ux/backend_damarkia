import { BaseRepository } from "./BaseRepository";
import ProductCategory  from "../model/ProductCategory"; 

export class ProductCategoryRepository extends BaseRepository<ProductCategory> {
  constructor() {
    super(ProductCategory);
  }
}