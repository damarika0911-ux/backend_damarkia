import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import  Product from "./Product";
import  ProductCategory  from "./ProductCategory";
import  AuditLog  from "./AduitLog";

@Table({ tableName: "users", timestamps: true })
class Users extends Model<Users> {
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
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    password!: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    phoneNumber!: number;

    @Column({
        type: DataType.ENUM("superadmin", "admin", "user"),
        allowNull: false
    })
    role!: string;

    @Column({
        type: DataType.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
    })
    status!: string;

    @HasMany(() => Product)
    products!: Product[];

    @HasMany(() => ProductCategory)
    productCategories!: ProductCategory[];

    @HasMany(() => AuditLog)
    auditLogs!: AuditLog[];
}

export default Users;