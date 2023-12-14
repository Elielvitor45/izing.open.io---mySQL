import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default
} from "sequelize-typescript";

@Table({ freezeTableName: true })
class Clientes extends Model<Clientes> {
  @PrimaryKey
  @Column
  idPas: string;

  @Column(DataType.DATE(6))
  ValidadePas: Date;

  @Default(null)
  @Column(DataType.TEXT)
  idCliente: string;

  @Default(null)
  @Column(DataType.TEXT)
  Nome: string;

  @Default(null)
  @Column
  Bloqueado: number;

  @Default(null)
  @Column(DataType.TEXT)
  Estado: string;
}

export default Clientes;