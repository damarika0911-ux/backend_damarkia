import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import Users from './User';

@Table({
    tableName: "product_categories",
    timestamps: true
})
class ProductCategory extends Model<ProductCategory> {
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
        type: DataType.STRING,
        allowNull: false
    })
    image!: string;

    @Column({
        type: DataType.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
    })
    status!: string;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    createdBy!: number;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    updatedBy!: number;

    @BelongsTo(() => Users)
    user!: Users;
}

export default ProductCategory;