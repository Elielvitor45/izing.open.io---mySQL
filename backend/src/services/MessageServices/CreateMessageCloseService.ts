import { logger } from "../../utils/logger";
// import MessageOffLine from "../../models/MessageOffLine";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";
import { QueryTypes } from "sequelize";

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

const verifyLimitMessages = async (contactId: number,message:string):Promise<boolean|void>=> {
  const query = `SELECT m.body FROM Messages m WHERE m.contactId = ${contactId} AND m.ack = 2 ORDER BY m.createdAt DESC LIMIT 3`;
  const data: any = await Message.sequelize?.query(query, {
    type: QueryTypes.SELECT
  });
  var count = 0;
  await data.forEach((item) => {
    if(item.body === message){
      count += 1;
    }
  });
  if (count >= 3) return false;
  
  return true;
}
const CreateMessageCloseService = async ({
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
    mediaType: "chat",
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
  const limit = await verifyLimitMessages(ticket.contactId,msg.body);
  if(limit === true){
    try {
      const msgCreated = await Message.create({
        ...messageData,
        mediaType: "chat"
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
      logger.error("CreateMessageCloseService", error);
    }
  }else{}
};


export default CreateMessageCloseService;






