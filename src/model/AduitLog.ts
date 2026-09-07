import { Table, Column, Model, DataType, ForeignKey } from "sequelize-typescript";
import Users from './User';
@Table({
    tableName: 'audit_logs',
    timestamps: true
})
class AuditLog extends Model<AuditLog> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    })
    id!: number;

    @Column({
        type: DataType.ENUM("create", "update", "delete"),
        allowNull: false
    })
    action!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    tableName!: string;

    @ForeignKey(() => Users)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    changedBy!: number;
}

export default AuditLog;