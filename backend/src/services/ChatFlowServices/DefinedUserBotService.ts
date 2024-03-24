import { QueryTypes } from "sequelize";
import User from "../../models/User";
// import AppError from "../../errors/AppError";
// import Queue from "../../models/Queue";
import Ticket from "../../models/Ticket";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";

const DefinedUserBotService = async (
  ticket: Ticket,
  queueId: string | number,
  tenantId: string | number,
  method = "R"
): Promise<void> => {
  // method: R = Random | B = Balanced ;
  // R: pega usuario de forma randomica;
  // B: pega o usuario com menor número de atendimentos;
  if (method === "R") return;
  let query = `
    SELECT u.id
    FROM Users u
    LEFT JOIN UsersQueues uq ON (u.id = uq.userId)
    WHERE u.isOnline = TRUE AND u.profile = 'user' AND u.tenantId = :tenantId AND uq.queueId = :queueId
    ORDER BY RAND()
    LIMIT 1
  `;
  if (method === "B") {
    query = `
      SELECT id
      FROM (
      SELECT u.id, u.name, COALESCE(COUNT(t.id), 0) qtd_atendimentos
      FROM Users u
      LEFT JOIN UsersQueues uq ON (u.id = uq.userId)
      LEFT JOIN Tickets t ON (t.userId = u.id)
      WHERE u.isOnline = TRUE AND t.status NOT in ('closed', 'close') AND u.profile = 'user' AND u.tenantId = :tenantId AND uq.queueId = :queueId
      GROUP BY u.id, u.name
      ORDER BY qtd_atendimentos ASC
      LIMIT 1 ) a
    `;
  }
  const user: any = await User.sequelize?.query(query, {
    replacements: {
      tenantId,
      queueId
    },
    type: QueryTypes.SELECT
  });
  console.log(user);
  if (user.length) {
    const userId = user[0].id;
    await ticket.update({
      userId
    });
    console.log(queueId)
    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "userDefine",
      userId
    });
  }
};

export default DefinedUserBotService;
