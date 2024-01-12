import LogTicket from "../../models/LogTicket";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import CheckLastCallService from "../CheckAsteriskService/CheckLastCallService";

interface Request {
  ticketId: string | number;
}

const ShowLogTicketService = async ({
  ticketId
}: Request): Promise<LogTicket[]> => {
  const logs = await LogTicket.findAll({
    where: {
      ticketId
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "queue"]
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["codigoPas"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });
  const pas = await CheckLastCallService({ticketId})
  return logs;
};

export default ShowLogTicketService;
