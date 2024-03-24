import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default
} from "sequelize-typescript";

@Table({ freezeTableName: true })
class Atendimentos extends Model<Atendimentos> {
    
    @PrimaryKey
    @Column
    CodAtendimento: number;

    @Column
    idPas: string;

    @Column
    Telefone: string;
   
    @Column(DataType.DATE(6))
    Data: Date;

    @Column(DataType.DATE(6))
    DataHoraAtendimento: Date;

    @Column(DataType.DATE(6))
    DataHoraFinalizacao: Date;

    @Column(DataType.TEXT)
    Tipo:string;
    
    @Column(DataType.TEXT)
    pas:string;

    @Column
    Tentativas:number;

    @Column
    TecnicoAtendimento:string;

    @Column(DataType.TEXT)
    DescAtendimento:string;

    @Column
    flagAtend:number;

    @Column
    LigacaoNaoAtendida:number;

    @Column
    MoreTreeMin:number;

    @Column(DataType.TEXT)
    Idioma:string;
   
}
export default Atendimentos;