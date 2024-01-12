import { sequelize } from "../../database";
import Ticket from "../../models/Ticket";
import { QueryTypes } from "sequelize";
import { query } from "express";
interface Request {
    ticketId: number | string,
    codigoPas: number | string;
}

const UpdateTicketPasService = async ({
    ticketId,
    codigoPas
}: Request): Promise<any> => {
    const query = ` 
    UPDATE Tickets t
    SET t.codigoPas = :codigoPas
    WHERE t.id = :ticketId;
  `;
    const data = await sequelize.query(query, {
        replacements: {
            ticketId,
            codigoPas
        },
        type: QueryTypes.UPDATE
    });
    return data;
};

export default UpdateTicketPasService;