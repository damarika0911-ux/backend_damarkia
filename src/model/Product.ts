import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Users from "./User";
import ProductCategory  from "./ProductCategory";

@Table({
    tableName: "products",
    timestamps: true
})
class Product extends Model<Product> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    title!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    description!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false
    })
    price!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    image!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    badge!: string;

    @Column({
        type: DataType.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
    })
    status!: string;

    @ForeignKey(() => ProductCategory)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    categoryId!: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    createdBy!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    updatedBy!: number;

    @BelongsTo(() => Users)
    user!: Users;

    @BelongsTo(() => ProductCategory)
    category!: ProductCategory;
}

export default Product;