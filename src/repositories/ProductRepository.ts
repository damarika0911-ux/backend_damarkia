import { BaseRepository } from "./BaseRepository";
import Product  from "../model/Product"; 

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }
}
