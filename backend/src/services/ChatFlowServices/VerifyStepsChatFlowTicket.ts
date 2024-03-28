/* eslint-disable no-return-assign */
import { Message as WbotMessage } from "whatsapp-web.js";
import socketEmit from "../../helpers/socketEmit";
// import SetTicketMessagesAsRead from "../../../helpers/SetTicketMessagesAsRead";
import Ticket from "../../models/Ticket";
// import { sleepRandomTime } from "../../../utils/sleepRandomTime";
// import CreateAutoReplyLogsService from "../AutoReplyServices/CreateAutoReplyLogsService";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import BuildSendMessageService from "./BuildSendMessageService";
import DefinedUserBotService from "./DefinedUserBotService";
// import SendWhatsAppMessage from "../SendWhatsAppMessage";
import IsContactTest from "./IsContactTest";
import { request } from "http";
import infoCliente from "../CheckAsteriskService/CheckPasService";
import CheckCustomer from "../CheckAsteriskService/VerifyClient";
import { QueryTypes, and } from "sequelize";
import { any, delay } from "bluebird";
import Queue from "../../models/Queue";
import User from "../../models/User";
import Contact from "../../models/Contact";
import UpdateTicketPasService from "../TicketServices/UpdateTicketPasService";
import AsteriskInsertAtendimento from "./AsteriskInsertAtendimento";





const isNextSteps = async (
  ticket: Ticket,
  chatFlow: any,
  step: any,
  stepCondition: any,
  blocked: boolean|undefined
): Promise<void> => {
  // action = 0: enviar para proximo step: nextStepId
  if (stepCondition.action === 0 || (blocked && stepCondition.action === undefined)) {
      await ticket.update({
        stepChatFlow: stepCondition.nextStepId,
        botRetries: 0,
        lastInteractionBot: new Date()
      });
    const nodesList = [...chatFlow.flow.nodeList];

    /// pegar os dados do proxumo step
    const nextStep = nodesList.find(
      (n: any) => n.id === stepCondition.nextStepId
    );

    var verifyNextStepCondition;
    var verifyStepCondition;
    if(nextStep && step){
      verifyNextStepCondition = nextStep.conditions.filter(condition => condition.type === 'p').length > 0;
      verifyStepCondition = step.conditions.filter(condition => condition.type === 'p').length > 0;
    }
    if(verifyNextStepCondition || verifyStepCondition){
      if(blocked){
        const messageData = {
          body:'Você não pode acessar o setor do suporte, pois anteriormente houve mais que 3 tentativas de digitar o codigo PAS, estamos encerrando seu ticket, caso queira ter acesso novamente, ligue para o suporte diretamente e informe um codigo PAS valido, ou entre em contato com o setor de vendas.',
          fromMe: true,
          read: true,
          sendType: "bot"
        };
        await CreateMessageSystemService({
          msg: messageData,
          tenantId: ticket.tenantId,
          ticket,
          sendType: messageData.sendType,
          status: "pending"
        });

        await delay(1000);

        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "autoClose"
        });

        await delay(3500);

        await ticket.update({
          chatFlowId: null,
          botRetries: 0,
          lastInteractionBot: new Date(),
          unreadMessages: 0,
          answered: false,
          status: "closed"
        });
        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });
        return;
      }
    }

    if (!nextStep) return;

    for (const interaction of nextStep.interactions) {
      await BuildSendMessageService({
        msg: interaction,
        tenantId: ticket.tenantId,
        ticket
      });
    }
    // await SetTicketMessagesAsRead(ticket);
  }
};

const isQueueDefine = async (
  ticket: Ticket,
  flowConfig: any,
  step: any,
  stepCondition: any
): Promise<void> => {
  // action = 1: enviar para fila: queue
  if (stepCondition.action === 1) {
    ticket.update({
      queueId: stepCondition.queueId,
      chatFlowId: null,
      stepChatFlow: null,
      botRetries: 0,
      lastInteractionBot: new Date()
    });
    if(stepCondition.queueId === 2){
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: undefined
      });
    }else{
      await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: stepCondition.queueId
      });
      const queueN = await Queue.findByPk(stepCondition.queueId);
      const messageData = {
        body:`Você está sendo direcionado(a) para a fila ${queueN?.queue}. Enquanto aguarda o atendimento, que deve iniciar em alguns minutos, por favor, descreva o motivo do seu contato. Isso nos ajudará a entender melhor suas necessidades e a fornecer um atendimento mais eficiente.`,
        fromMe: true,
        read: true,
        sendType: "bot"
      };
      await CreateMessageSystemService({
        msg: messageData,
        tenantId: ticket.tenantId,
        ticket,
        sendType: messageData.sendType,
        status: "pending"
      });
    }
    if (flowConfig?.configurations?.autoDistributeTickets) {
      DefinedUserBotService(
        ticket,
        stepCondition.queueId,
        ticket.tenantId,
        flowConfig?.configurations?.autoDistributeTickets
      );
    }
  }
};

const isUserDefine = async (
  ticket: Ticket,
  step: any,
  stepCondition: any
): Promise<void> => {
  // action = 2: enviar para determinado usuário
  if (stepCondition.action === 2) {
    ticket.update({
      userId: stepCondition.userIdDestination,
      // status: "pending",
      chatFlowId: null,
      stepChatFlow: null,
      botRetries: 0,
      lastInteractionBot: new Date()
    });
    await CreateLogTicketService({
      userId: stepCondition.userIdDestination,
      ticketId: ticket.id,
      type: "userDefine"
    });
  }
};

// enviar mensagem de boas vindas à fila ou usuário
const sendWelcomeMessage = async (
  ticket: Ticket,
  flowConfig: any
): Promise<void> => {
  if (flowConfig?.configurations?.welcomeMessage?.message) {
    const messageData = {
      body: flowConfig.configurations?.welcomeMessage.message,
      fromMe: true,
      read: true,
      sendType: "bot"
    };

    await CreateMessageSystemService({
      msg: messageData,
      tenantId: ticket.tenantId,
      ticket,
      sendType: messageData.sendType,
      status: "pending"
    });
  }
};

const isRetriesLimit = async (
  ticket: Ticket,
  flowConfig: any
): Promise<boolean> => {
  // verificar o limite de retentativas e realizar ação
  const maxRetryNumber = flowConfig?.configurations?.maxRetryBotMessage?.number;
  if (
    flowConfig?.configurations?.maxRetryBotMessage &&
    maxRetryNumber &&
    ticket.botRetries >= maxRetryNumber
  ) {
    const destinyType = flowConfig.configurations.maxRetryBotMessage.type;
    const { destiny } = flowConfig.configurations.maxRetryBotMessage;
    const updatedValues: any = {
      chatFlowId: null,
      stepChatFlow: null,
      botRetries: 0,
      lastInteractionBot: new Date()
    };
    const logsRetry: any = {
      ticketId: ticket.id,
      type: destinyType === 1 ? "retriesLimitQueue" : "retriesLimitUserDefine"
    };
    const cliente = await Contact.findByPk(ticket.contactId);
    if (destinyType === 1) {
       if(destiny === ''){
         updatedValues.queueId = 1;
         logsRetry.queueId = 1;
       }else{
        updatedValues.queueId = destiny;
        logsRetry.queueId = destiny;
      }
      const queueN = await Queue.findByPk(destiny);
      const messageData = {
        body:
          `${cliente?.pushname}, você não selecionou opções após ${flowConfig.configurations.maxRetryBotMessage.number} tentativas. Você será transferido para a fila ${queueN?.queue}. Aguarde alguns momentos para ser atendido por um de nossos atendentes. Obrigado pela compreensão.
          `,
        fromMe: true,
        read: true,
        sendType: "bot"
      };
      await CreateMessageSystemService({
        msg: messageData,
        tenantId: ticket.tenantId,
        ticket,
        sendType: messageData.sendType,
        status: "pending"
      });
    }
    // enviar para usuario
    if (destinyType === 2) {
      updatedValues.userId = destiny;
      logsRetry.userId = destiny;
      const user = await User.findByPk(destiny);
      const messageData = {
        body:
          `${cliente?.pushname}, você não selecionou opções após ${flowConfig.configurations.maxRetryBotMessage.number} tentativas. Você será transferido para o usuario(a) ${user?.name}. Aguarde alguns momentos ate ser atendido. Obrigado pela compreensão.`,
        fromMe: true,
        read: true,
        sendType: "bot"
      };
      await CreateMessageSystemService({
        msg: messageData,
        tenantId: ticket.tenantId,
        ticket,
        sendType: messageData.sendType,
        status: "pending"
      });
    }
    ticket.update(updatedValues);
    await CreateLogTicketService(logsRetry);
    socketEmit({
      tenantId: ticket.tenantId,
      type: "ticket:update",
      payload: ticket
    });

    // enviar mensagem de boas vindas à fila ou usuário
    await sendWelcomeMessage(ticket, flowConfig);
    return true;
  }
  return false;
};

const isAnswerCloseTicket = async (
  flowConfig: any,
  ticket: Ticket,
  message: string,
): Promise<boolean> => {
    if (
    !flowConfig?.configurations?.answerCloseTicket ||
    flowConfig?.configurations?.answerCloseTicket?.length < 1
  ) {
    return false;
  }
  // verificar condição com a ação
  const params = flowConfig.configurations.answerCloseTicket.find(
    (condition: any) => {
      return (
        String(condition).toLowerCase().trim() ===
        String(message).toLowerCase().trim()
      );
    }
  );
  
  if (params) {
    const messageData = {
      body:'Estamos encerrando seu atendimento. Por favor, sinta-se a vontade para iniciar um novo atendimento!',
      fromMe: true,
      read: true,
      sendType: "bot"
    };
    
    await CreateMessageSystemService({
      msg: messageData,
      tenantId: ticket.tenantId,
      ticket,
      sendType: messageData.sendType,
      status: "closed"
    });

    await delay(3000);

    await ticket.update({
      chatFlowId: null,
      stepChatFlow: null,
      botRetries: 0,
      lastInteractionBot: new Date(),
      unreadMessages: 0,
      answered: false,
      status: "closed"
    });

    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "autoClose"
    });

    socketEmit({
      tenantId: ticket.tenantId,
      type: "ticket:update",
      payload: ticket
    });
    return true;
  }
  return false;
};

const SendMessagePas = async(ticket,verifyStepCondition, pasCondition,chatFlow, contact): Promise<boolean|void> => {
  if(pasCondition && !contact.blocked){
    const nodesList = [...chatFlow.flow.nodeList];
    const nextStep = nodesList.find(
      (n: any) => n.id === verifyStepCondition.nextStepId
    );
    if(!nextStep) return;
    for (const interaction of nextStep.interactions) {
      if(interaction){
        await BuildSendMessageService({
          msg: interaction,
          tenantId: ticket.tenantId,
          ticket
        });
      }
    }
    await ticket.update({
      stepChatFlow: verifyStepCondition.nextStepId,
      botRetries: 0,
      lastInteractionBot: new Date()
    });
  }else{
  await ticket.update({
    botRetries: ticket.botRetries + 1,
    lastInteractionBot: new Date()
  });

  if(ticket.botRetries > 3){  
    await ticket.update({
      botRetries: 0,
      lastInteractionBot: new Date(),
    });
    await contact.update({
      Blocked: true
    });
    await delay(1000);
    return true;
  }
  const messageData = {
    body: `O PAS inserido é inválido. Por favor, digite o codigo PAS novamente ou pressione 0 para finalizar o atendimento.| Tentativas ${ticket.botRetries} de 3`,
    fromMe: true,
    read: true,
    sendType: "bot"
  };
  await CreateMessageSystemService({
    msg: messageData,
    tenantId: ticket.tenantId,
    ticket,
    sendType: messageData.sendType,
    status: "pending"
  });
  }
}
const VerifyStepsChatFlowTicket = async (
  msg: WbotMessage | any,
  ticket: Ticket | any
): Promise<void> => {

  let celularTeste;
  if (
    ticket.chatFlowId &&
    ticket.status === "pending" &&
    !msg.fromMe &&
    !ticket.isGroup &&
    !ticket.answered
  ) {
    if (ticket.chatFlowId) {
      const chatFlow = await ticket.getChatFlow();
      if (chatFlow.celularTeste) {
        celularTeste = chatFlow.celularTeste.replace(/\s/g, "");
      }

      const step = chatFlow.flow.nodeList.find(
        (node: any) => node.id === ticket.stepChatFlow
      );

      const flowConfig = chatFlow.flow.nodeList.find(
        (node: any) => node.type === "configurations"
      );

      // verificar condição com a ação do step
      var stepCondition = step.conditions.find((conditions: any) => {
        if (conditions.type === "US") return true;
        const newConditions = conditions.condition.map((c: any) =>
          String(c).toLowerCase().trim()
        );
        const message = String(msg.body).toLowerCase().trim();

        if(conditions.type !='p'){
          return newConditions.includes(message);
        }
      });
      var pasCondition;
      var verifyStepCondition;
      if (!stepCondition) {
        verifyStepCondition = step.conditions.find((conditions: any) => {
          if (conditions.type.includes('p')) {
            return true;
          } else {
            return undefined;
          }
        });
      }
      if(verifyStepCondition) {
        pasCondition = await CheckCustomer(msg.body);
      }
      if (pasCondition){
        const ticketId = ticket.id
        const codigoPas = pasCondition.idPas
        await UpdateTicketPasService({ticketId, codigoPas})
        await AsteriskInsertAtendimento(pasCondition.idPas,ticket.contact.number);
      }
      const contact = await Contact.findOne({
        where:{id: ticket?.contactId}
      });

      if(verifyStepCondition) {
        if(contact?.Blocked){
          await isNextSteps(ticket, chatFlow, step, verifyStepCondition,contact?.Blocked);
        }else{
          pasCondition = await CheckCustomer(msg.body);
        }
      }
      if (
        !ticket.isCreated &&
        (await isAnswerCloseTicket(flowConfig, ticket, msg.body))
      ){
        return;
      }      
      if (stepCondition && !ticket.isCreated || verifyStepCondition && !ticket.isCreated) {
        if (
          await IsContactTest(
            ticket.contact.number,
            celularTeste,
            ticket.channel
          )
        ){
          return;
        }
        if(pasCondition || verifyStepCondition){
          if(verifyStepCondition.queueId && pasCondition){
            await isQueueDefine(ticket, flowConfig, step, verifyStepCondition);
          }else{
            const verifyBlocked = await SendMessagePas(ticket,verifyStepCondition,pasCondition,chatFlow,contact);
            console.log(verifyBlocked)
            if(verifyBlocked){
                const messageData = {
                  body:'Você não pode acessar o setor do suporte, pois houve mais que 3 tentativas de digitar o codigo PAS, estamos encerrando seu ticket, caso queira ter acesso novamente, ligue para o suporte diretamente e informe um codigo PAS valido, ou entre em contato com o setor de vendas.',
                  fromMe: true,
                  read: true,
                  sendType: "bot"
                };
                await CreateMessageSystemService({
                  msg: messageData,
                  tenantId: ticket.tenantId,
                  ticket,
                  sendType: messageData.sendType,
                  status: "pending"
                });
                await delay(1000);
                await CreateLogTicketService({
                  ticketId: ticket.id,
                  type: "autoClose"
                });
                await delay(3500);
                await ticket.update({
                  chatFlowId: null,
                  botRetries: 0,
                  lastInteractionBot: new Date(),
                  unreadMessages: 0,
                  answered: false,
                  status: "closed"
                });
                socketEmit({
                  tenantId: ticket.tenantId,
                  type: "ticket:update",
                  payload: ticket
                });
              }
          }
        }else{
          // action = 0: enviar para proximo step: nextStepId
          await isNextSteps(ticket, chatFlow, step, stepCondition,contact?.Blocked);
          // action = 1: enviar para fila: queue
          await isQueueDefine(ticket, flowConfig, step, stepCondition);
        // action = 2: enviar para determinado usuário
          await isUserDefine(ticket, step, stepCondition);

        }
        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });
        if(!stepCondition === undefined && verifyStepCondition===undefined){
          if (stepCondition.action === 1 || stepCondition.action === 2) {
            await sendWelcomeMessage(ticket, flowConfig);
          }
        }
        
      } else {
        // Verificar se rotina em teste
        if (
          await IsContactTest(
            ticket.contact.number,
            celularTeste,
            ticket.channel
          )
        ){
          return;
        }
        // se ticket tiver sido criado, ingnorar na primeria passagem
        if (!ticket.isCreated) {
          if (await isRetriesLimit(ticket, flowConfig)){
            return;}
          const messageData = {
            body:
              flowConfig.configurations.notOptionsSelectMessage.message+` | ${ticket.botRetries + 1} de ${flowConfig.configurations.maxRetryBotMessage.number}`,
            fromMe: true,
            read: true,
            sendType: "bot"
          };
        if(messageData.body !=''){
            await CreateMessageSystemService({
              msg: messageData,
              tenantId: ticket.tenantId,
              ticket,
              sendType: messageData.sendType,
              status: "pending"
            });
            await delay(2000);
            await ticket.update({
              botRetries: ticket.botRetries + 1,
              lastInteractionBot: new Date()
            });
            
            for (const interaction of step.interactions) {
              await BuildSendMessageService({
               msg: interaction,
               tenantId: ticket.tenantId,
               ticket,
             });
            }  
            return;
          }
        }else{
          for (const interaction of step.interactions) {
            await BuildSendMessageService({
             msg: interaction,
             tenantId: ticket.tenantId,
             ticket,
           });
         }
          return;
        }
      }
      // await SetTicketMessagesAsRead(ticket);
      // await SetTicketMessagesAsRead(ticket);
    }
  }
};

export default VerifyStepsChatFlowTicket;
