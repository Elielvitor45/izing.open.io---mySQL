import { QueryTypes } from "sequelize";
import Atendimentos from "../../asteriskmodels/Atendimentos";

const query = `INSERT INTO atendimentos (idPas,Telefone,Tipo,PAS,Tentativas) VALUES (:CodigoPas,:Telefone,'NORMAL','SIM',1);`;
const AsteriskInsertAtendimento = async (CodigoPas: number, Telefone: string) => {
    if (CodigoPas && Telefone) {
        await Atendimentos.sequelize?.query(query, {
            replacements: {
                CodigoPas,
                Telefone
            },
            type: QueryTypes.INSERT,
        });
    } else {
        console.log('PAS ou Telefone indefinidos')
    }
};
export default AsteriskInsertAtendimento;