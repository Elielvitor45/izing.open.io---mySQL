import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { removeWbot } from "../libs/wbot";
import AppError from "../errors/AppError";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;

  const whatsapps = await ListWhatsAppsService(tenantId);

  return res.status(200).json(whatsapps);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;

  const whatsapp = await ShowWhatsAppService({ id: whatsappId, tenantId });

  return res.status(200).json(whatsapp);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { tenantId } = req.user;
  const whatsapps = await ListWhatsAppsService(tenantId);
  if (whatsapps.length >= Number(process.env.CONNECTIONS_LIMIT)) {
    throw new AppError("ERR_NO_PERMISSION_CONNECTIONS_LIMIT", 400);
  }

  const { whatsapp } = await CreateWhatsAppService({
    ...whatsappData,
    whatsappId,
    tenantId
  });

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { tenantId } = req.user;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    tenantId
  });

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { tenantId } = req.user;
  await DeleteWhatsAppService(whatsappId, tenantId);
  removeWbot(+whatsappId);

  const io = getIO();
  io.emit(`${tenantId}:whatsapp`, {
    action: "delete",
    whatsappId: +whatsappId
  });

  return res.status(200).json({ message: "Whatsapp deleted." });
};

// const remove = async (req: Request, res: Response): Promise<Response> => {
//   const { whatsappId } = req.params;
//   const { tenantId } = req.user;
//   const channel = await ShowWhatsAppService({ id: whatsappId, tenantId });
//   const io = getIO();
//   try {
//     if (channel.type === "whatsapp") {
//       const wbot = getWbot(channel.id);
//       await setValue(`${channel.id}-retryQrCode`, 0);
//       await wbot
//         .logout()
//         .catch(error => logger.error("Erro ao fazer logout da conexão", error)); // --> fecha o client e conserva a sessão para reconexão (criar função desconectar)
//       removeWbot(channel.id);
//       // await wbot
//       //   .destroy()
//       //   .catch(error => logger.error("Erro ao destuir conexão", error)); // --> encerra a sessão e desconecta o bot do whatsapp, geando um novo QRCODE
//     }

//     if (channel.type === "telegram") {
//       const tbot = getTbot(channel.id);
//       await tbot.telegram
//         .logOut()
//         .catch(error => logger.error("Erro ao fazer logout da conexão", error));
//       removeTbot(channel.id);
//     }

//     if (channel.type === "instagram") {
//       const instaBot = getInstaBot(channel.id);
//       await instaBot.destroy();
//       removeInstaBot(channel);
//     }
//     await channel.update({
//       status: "DISCONNECTED",
//       session: "",
//       qrcode: null,
//       retries: 0
//     });
//   } catch (error) {
//     logger.error(error);
//     await channel.update({
//       status: "DISCONNECTED",
//       session: "",
//       qrcode: null,
//       retries: 0
//     });