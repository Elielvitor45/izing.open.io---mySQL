/* eslint-disable eqeqeq */
import { QueryTypes } from "sequelize";

import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";

const FindUpdateTicketsInactiveChatBot = async (): Promise<void> => {
  const query = `
  SELECT
  t.id,
  t.email,
  (SELECT COUNT(*) FROM tickets WHERE status = 'open' AND email = t.email) AS qtd_em_atendimento,
  (SELECT COUNT(*) FROM tickets WHERE status = 'pending' AND email = t.email) AS qtd_pendentes,
  (SELECT COUNT(*) FROM tickets WHERE status = 'closed' AND email = t.email) AS qtd_resolvidos,
  (SELECT COUNT(*) FROM tickets WHERE email = t.email) AS qtd_por_usuario,
  JSON_EXTRACT(config, '$.configurations.notResponseMessage.type') as type_action,
  JSON_EXTRACT(config, '$.configurations.notResponseMessage.destiny') as destiny
FROM tickets t
INNER JOIN ChatFlow cf ON t.tenantId = cf.tenantId AND cf.id = t.chatFlowId
INNER JOIN Settings s ON s.tenantId = cf.tenantId AND s.key = 'botTicketActive'
WHERE t.chatFlowId = s.value
AND t.status = 'pending'
AND t.lastInteractionBot < CURRENT_TIMESTAMP - INTERVAL JSON_EXTRACT(config, '$.configurations.notResponseMessage.time') MINUTE
AND (t.queueId IS NULL AND t.userId IS NULL)

  `;

  const tickets: any = await Ticket.sequelize?.query(query, {
    type: QueryTypes.SELECT
  });
  Promise.all(
    tickets.map(async (item: any) => {
      // se não houve destino, retornar
      if (!item.destiny) return;
      const ticket = await Ticket.findByPk(item.id);
      if (ticket) {
        const values: any = {
          chatFlowId: null,
          stepChatFlow: null,
          botRetries: 0,
          lastInteractionBot: new Date()
        };
        // instance.type_action: 1 = fila | 2 = usuario
        if (item.type_action == 1) {
          values.queueId = item.destiny;
        }
        if (item.type_action == 2) {
          values.userId = item.destiny;
        }
        await ticket.update(values);
        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });
      }
    })
  );
};

export default FindUpdateTicketsInactiveChatBot;
