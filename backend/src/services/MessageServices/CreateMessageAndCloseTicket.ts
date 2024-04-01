import { deflate } from "zlib";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";
import { delay } from "bluebird";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
interface MessageData {
    ticketId: number;
    body: string;
    contactId?: number;
    fromMe?: boolean;
    read?: boolean;
    mediaType?: string;
    mediaUrl?: string;
    timestamp?: number;
    internalId?: string;
    userId?: string | number;
    quotedMsgId?: string;
    // status?: string;
    scheduleDate?: string | Date;
    sendType?: string;
    status?: string;
    idFront?: string;
    tenantId: string | number;
  }
  
  interface MessageRequest {
    body: string;
    fromMe: boolean;
    read: boolean;
    quotedMsg?: Message;
  }

interface Request {
    msg: MessageRequest | any;
    scheduleDate?: string | Date;
    sendType: string;
    status: string;
    tenantId: string | number;
    medias?: Express.Multer.File[];
    ticket: Ticket;
    userId?: number | string;
    idFront?: string;
}

const CreateMessageAndCloseTicket = async ({
    msg,
    tenantId,
    medias,
    ticket,
    userId,
    scheduleDate,
    sendType,
    status,
    idFront
  }: Request): Promise<void> => {
    const messageData: MessageData = {
        ticketId: ticket.id,
        body: msg.body,
        contactId: ticket.contactId,
        fromMe: sendType === "API" ? true : msg?.fromMe,
        read: true,
        mediaType: "close",
        mediaUrl: undefined,
        timestamp: new Date().getTime(),
        quotedMsgId: msg?.quotedMsg?.id,
        userId,
        scheduleDate,
        sendType,
        status,
        tenantId,
        idFront
    };
    try {
        const msgCreated = await Message.create({
            ...messageData,
            mediaType: "close"
          });
    
          const messageCreated = await Message.findByPk(msgCreated.id, {
            include: [
              {
                model: Ticket,
                as: "ticket",
                where: { tenantId },
                include: ["contact"]
              },
              {
                model: Message,
                as: "quotedMsg",
                include: ["contact"]
              }
            ]
          });
    
          if (!messageCreated) {
            // throw new AppError("ERR_CREATING_MESSAGE", 501);
            throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
          }
    
          await ticket.update({
            lastMessage: messageCreated.body,
            lastMessageAt: new Date().getTime(),
            answered: true
          });

          socketEmit({
            tenantId,
            type: "chat:create",
            payload: messageCreated
          });
    } catch (error) {
        console.error(error)
    }
  };
  export default CreateMessageAndCloseTicket;