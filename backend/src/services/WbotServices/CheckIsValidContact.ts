import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
// import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";

const CheckIsValidContact = async (
  number: string,
  tenantId: string | number
): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(tenantId);
  const wbot = getWbot(defaultWhatsapp.id);
  const ticketC = await Ticket.findOne({
    where: { tenantId,  status: ['open','pending'] },
    attributes: ["id"],
    include: [
      {
        model: Contact,
        where: {number:number}
      }
    ]
  });
  try {
    // const isValidNumber = await wbot.isRegisteredUser(`${number}@c.us`);
    if(defaultWhatsapp.number === number){
      throw new AppError("numberEqualWhatsappUserNumber", 400);
    }else if(ticketC){
      throw new AppError("ticketisopenorpending", 400);
    }
    const idNumber = await wbot.getNumberId(number);
    if (!idNumber) {
      throw new AppError("invalidNumber", 400);
    }
    return idNumber;
  } catch (err: any) {
    logger.error(`CheckIsValidContact | Error: ${err}`);
    // StartWhatsAppSessionVerify(defaultWhatsapp.id, err);
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }else if(err.message === "numberEqualWhatsappUserNumber"){
      throw new AppError("ERR_WAPP_EQUAL_CONTACT_USER");
    }else if(err.message === "ticketisopenorpending"){
      throw new AppError("ERR_WAPP_TICKET_OPEN_OR_PENDING");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
