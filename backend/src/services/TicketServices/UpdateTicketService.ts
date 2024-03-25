import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import socketEmit from "../../helpers/socketEmit";
import CreateLogTicketService from "./CreateLogTicketService";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import { generateMessage } from "../../utils/mustache";
import Whatsapp from "../../models/Whatsapp";
import UsersQueues from "../../models/UsersQueues";

interface TicketData {
  status?: string;
  isExternal?: number | null;
  userId?: number | null;
  tenantId: number | string;
  queueId?: number | null;
  autoReplyId?: number | string | null;
  stepAutoReplyId?: number | string | null;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
  isTransference?: string | boolean | null;
  userIdRequest: number | string;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  isTransference,
  userIdRequest
}: Request): Promise<Response> => {
  var { status, userId, tenantId, queueId, isExternal } = ticketData;
  if(userId && !queueId){
    const queueID = await UsersQueues.findOne({
      where: {
        userId: userId
      }
    });
    queueId = queueID?.queueId;
  }
  const ticket = await Ticket.findOne({
    where: { id: ticketId, tenantId },
    include: [
      {
        model: Contact,
        as: "contact",
        include: [
          "extraInfo",
          "tags",
          {
            association: "wallets",
            attributes: ["id", "name"]
          }
        ]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await SetTicketMessagesAsRead(ticket);

  const wbot = await GetTicketWbot(ticket);
  
  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id);
  }

  // verificar se o front envia close e substituir por closed
  const statusData = status === "close" ? "closed" : status;
  const data: any = {
    status: statusData,
    queueId,
    userId
  };
  const whatsapp = await Whatsapp.findOne({
    where: { id: ticket.whatsappId, tenantId }
  });

  // se atendimento for encerrado, informar data da finalização
  if (statusData === "closed") {
    data.closedAt = new Date().getTime();
  }

  // se iniciar atendimento, retirar o bot e informar a data
  if (oldStatus === "pending" && statusData === "open") {
    data.autoReplyId = null;
    data.stepAutoReplyId = null;
    data.startedAttendanceAt = new Date().getTime();
  }

  await ticket.update(data);

  // logar o inicio do atendimento
  if (oldStatus === "pending" && statusData === "open") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "open"
    });
  }

  // logar ticket resolvido
  if (statusData === "closed") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "closed"
    });
  }

  // logar ticket retornado à pendente
  if (oldStatus === "open" && statusData === "pending") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "pending"
    });
  }

  if (isTransference) {
    // tranferiu o atendimento
    if (userId && !queueId) {
      await CreateLogTicketService({
        userId: userIdRequest,
        ticketId,
        type: "transfered"
      });
      // recebeu o atendimento tansferido
      if (userId) {
        await CreateLogTicketService({
          userId,
          ticketId,
          type: "receivedTransfer"
        });
      }
    } else if (!userId && queueId) {
        await CreateLogTicketService({
          queueId: queueId,
          ticketId,
          type: "transfered"
        });
        // recebeu o atendimento tansferido
        if (queueId) {
          await CreateLogTicketService({
            queueId,
            ticketId,
            type: "receivedTransfer"
          });
        }
    }
  }
  await ticket.reload();

  if (isTransference) {
    await ticket.setDataValue("isTransference", true);
  }

  //enviar mensagem de saudação ao iniciar o atendimento
  if (statusData === "open" && !(isExternal == 1)) {
    if (isTransference && userId) {
      if (whatsapp?.greetingMessage) {
        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          generateMessage(`${whatsapp?.greetingMessage}`, ticket),
        )
      }
    } else if (!isTransference) {
      if (whatsapp?.greetingMessage) {
        await wbot.sendMessage(`${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
          generateMessage(`${whatsapp?.greetingMessage}`, ticket),
        )
      }
    }
  }
  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
