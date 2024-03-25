import {
  Contact as WbotContact,
  Message as WbotMessage,
  Client
} from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import { logger } from "../../../utils/logger";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import IsValidMsg from "./IsValidMsg";
import VerifyContact from "./VerifyContact";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";
import verifyBusinessHours from "./VerifyBusinessHours";
import VerifyStepsChatFlowTicket from "../../ChatFlowServices/VerifyStepsChatFlowTicket";
import Queue from "../../../libs/Queue";
import Setting from "../../../models/Setting";
import TimerCloseTicket from "../LimitTimeService";
import { delay } from "bluebird";
import UpdateTicketService from "../../TicketServices/UpdateTicketService";

var compareActivation = false;
interface Session extends Client {
  id: number;
}
let dictionary = new Map<number, boolean>();
const DictionaryVerifyandCreate = async (ticketId:number):Promise<boolean|void> => {
  if(!dictionary.has(ticketId)){
    dictionary.set(ticketId,true);
    return false;
  }else{
    return true;
  }
}
const DictionaryUpdate = async (ticketId:number,value:boolean):Promise<void> => {
  dictionary.delete(ticketId);
}
const HandleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!IsValidMsg(msg)) {
        return;
      }
      let whatsapp;
	  
	  whatsapp = await ShowWhatsAppService({ id: wbot.id });

	  const { tenantId, number } = whatsapp;

	  //IGNORAR MENSAGENS DE GRUPO       
	  const Settingdb = await Setting.findOne({
		where: {key: 'ignoreGroupMsg', tenantId: tenantId }
	  });
	  if(Settingdb?.value == 'enabled') {
		if (
		  msg.from === "status@broadcast" ||
		  msg.to.endsWith("@g.us") ||
      msg.from.endsWith("@g.us") 
		) {
		  return;
		}
	  }
	  //IGNORAR MENSAGENS DE GRUPO

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        if (msg.fromMe) {
          if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard")
            return;

          msgContact = await wbot.getContactById(msg.to);
        } else {
          msgContact = await msg.getContact();
        }

        const chat = await msg.getChat();

        if (chat.isGroup) {
          let msgGroupContact;

          if (msg.fromMe) {
            msgGroupContact = await wbot.getContactById(msg.to);
          } else {
            msgGroupContact = await wbot.getContactById(msg.from);
          }

          groupContact = await VerifyContact(msgGroupContact, tenantId);
        }

        const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;
		 if(unreadMessages === 0 && whatsapp.farewellMessage === msg.body) return;

        // const profilePicUrl = await msgContact.getProfilePicUrl();
        const contact = await VerifyContact(msgContact, tenantId);
        await delay(1000);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages,
          tenantId,
          groupContact,
          msg,
          channel: "whatsapp"
        });
        const verifyDictionary = await DictionaryVerifyandCreate(ticket.id);
        if(verifyDictionary){
          return;
        }
        const ticketId = ticket.id;

        if(msg.ack === 1 && number === msg.from.split('@')[0] ){
          // await UpdateStatusTicketService("open", ticketId, tenantId);
          if(ticket.status !== "open"){
            const userIdRequest = 1;
            await UpdateTicketService({
              ticketData: { status: "open", tenantId , userId: userIdRequest, isExternal: 1 },
              ticketId,
              userIdRequest
            });
          }
        }
        if (ticket?.isCampaignMessage) {
          resolve();
          await DictionaryUpdate(ticket.id,false);
          return;
        }
        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, contact);
        } else {
          await VerifyMessage(msg, ticket, contact);
        }
        
        try {
          if (compareActivation === false) {
            compareActivation = true;
            setInterval(TimerCloseTicket,300000);
          }
        } catch (error) {
          compareActivation = false;
          console.log(error);
        }
        const chatFlow = await ticket.getChatFlow();
        // await VerifyAutoReplyActionTicket(msg, ticket);
        const verifyClose = await verifyBusinessHours(msg, ticket);
        if (chatFlow?.dataValues.isActive) {
          if ((verifyClose === false || msg.body === '')) {
          } else {
            await VerifyStepsChatFlowTicket(msg, ticket);
          }
        }
        const apiConfig: any = ticket.apiConfig || {};
        if (
          !msg.fromMe &&
          !ticket.isGroup &&
          !ticket.answered &&
          apiConfig?.externalKey &&
          apiConfig?.urlMessageStatus
        ) {
          const payload = {
            timestamp: Date.now(),
            msg,
            messageId: msg.id.id,
            ticketId: ticket.id,
            externalKey: apiConfig?.externalKey,
            authToken: apiConfig?.authToken,
            type: "hookMessage"
          };
          Queue.add("WebHooksAPI", {
            url: apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }
        await DictionaryUpdate(ticket.id,false);
        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default HandleMessage;
