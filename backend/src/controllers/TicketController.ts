import { Request, Response } from "express";
import { Op } from "sequelize";
// import GetWbotMessage from "../helpers/GetWbotMessage";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Whatsapp from "../models/Whatsapp";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";
import { generateMessage } from "../utils/mustache";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowLogTicketService from "../services/TicketServices/ShowLogTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import { ParsedUrlQueryInput } from "querystring";
import CheckLastCallService from "../services/CheckAsteriskService/CheckLastCallService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string[];
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queuesIds: string[];
  isNotAssignedUser: string;
  includeNotQueueDefined: string;
};

type Pas = {
  pas: boolean|undefined;
  startDate: string;
  endDate: string;
};

interface TicketData {
  contactId: number;
  status: string;
  userId: number;
  isActiveDemand: boolean;
  tenantId: string | number;
  channel: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  
  const { tenantId, profile } = req.user;
  const {
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined,
  } = req.query as IndexQuery;

  var pas:boolean|undefined;
  var startDate:string|undefined;
  var endDate:string|undefined;
  if(req.query && req.query.pas){
    ({ pas, startDate, endDate } = req.query as Pas)
  }
  
  const userId = req.user.id;

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined,
    tenantId,
    profile,
    pas,
    startDate,
    endDate
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { contactId, status, userId, channel }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    tenantId,
    channel
  });

  // se ticket criado pelo próprio usuário, não emitir socket.
  if (!userId) {
    const io = getIO();
    io.to(`${tenantId}:${ticket.status}`).emit(`${tenantId}:ticket`, {
      action: "create",
      ticket
    });
  }

  return res.status(200).json(ticket);
};

export const showPas = async (req: Request, res: Response): Promise<Response> => {
  const { startDate } = req.params;
  const { endDate } = req.params;
  const { tenantId } = req.user;
  console.log('observando')
  const ab = 1;
  return res.status(200).json(ab);

}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userId = req.user.id;

  const ticket = await ShowTicketService({ id: ticketId, tenantId });
  // const messages = await Message.findAll({
  //   where: {
  //     fromMe: true,
  //     ticketId: ticket.id,
  //     ack: 0,
  //     messageId: { [Op.not]: null }
  //   },
  //   logging: console.log
  // });
  // if (messages) {
  //   await Promise.all(
  //     messages.map(async message => {
  //       console.info(message);
  //       const msg = await GetWbotMessage(ticket, message.messageId);
  //       console.log(msg);
  //     })
  //   );
  // }
  const where = {
    contactId: ticket.contactId,
    scheduleDate: { [Op.not]: null },
    status: "pending"
  };
  const scheduledMessages = await Message.findAll({
    where
    // logging: console.log
  });

  ticket.setDataValue("scheduledMessages", scheduledMessages);

  await CreateLogTicketService({
    userId,
    ticketId,
    type: "access"
  });

  return res.status(200).json(ticket);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userIdRequest = req.user.id;
  const { isTransference } = req.body;

  const ticketData: TicketData = { ...req.body, tenantId };
  
  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    isTransference,
    userIdRequest
  });
  
  //enviar mensagem de despedida ao encerrar atendimento
  if (ticket.status === "closed") {
	const whatsapp = await Whatsapp.findOne({
		where: { id: ticket.whatsappId, tenantId }
	});	
	if(whatsapp?.farewellMessage){
        await SendWhatsAppMessage({body: generateMessage(`${whatsapp?.farewellMessage}`, ticket), ticket});    
    }
  };

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const userId = req.user.id;

  const ticket = await DeleteTicketService({ id: ticketId, tenantId, userId });

  const io = getIO();
  io.to(`${tenantId}:${ticket.status}`)
    .to(`${tenantId}:${ticketId}`)
    .to(`${tenantId}:notification`)
    .emit(`${tenantId}:ticket`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};

export const showLogsTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const logsTicket = await ShowLogTicketService({ ticketId });
  const logsCalls = await CheckLastCallService({ ticketId });
  const postData = {
    logsTicket: logsTicket,
    logsCalls: logsCalls
  }
  return res.status(200).json(postData);
};
