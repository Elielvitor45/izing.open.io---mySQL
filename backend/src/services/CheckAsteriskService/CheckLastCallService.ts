
import Ticket from "../../models/Ticket";
import { QueryTypes } from "sequelize";
import Atendimentos from "../../asteriskmodels/Atendimentos";
interface Request {
    ticketId: number | string,
}

const  CheckLastCallService = async ({
    ticketId
}: Request): Promise<any> => {
  const query1 = ` 
  SELECT a.Telefone, a.Data, a.Idioma, a.idPas
  FROM Atendimentos a 
  WHERE a.idPas = :replace
  ORDER BY a.Data DESC
  LIMIT 3
`;
    const dataPas = await Ticket.findByPk(ticketId);
    const replace = dataPas?.codigoPas;
    console.log(replace)
    const data = await Atendimentos.sequelize?.query(query1, {
        replacements: {
            replace
        },
        type: QueryTypes.SELECT
    });
    console.log("dasdsadsadsadsa",data)
    return data;
};

export default CheckLastCallService;