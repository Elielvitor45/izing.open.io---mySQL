import ChatFlow from "../../models/ChatFlow";

interface Response {
  chatFlow: ChatFlow[];
}

interface Request {
  tenantId: number | string;
}

const ListChatFlowService = async ({
  tenantId
}: Request): Promise<Response> => {
  const chatFlow = await ChatFlow.findAll({
    where: { tenantId, isBlocked: false }
  });

  return { chatFlow };
};

export default ListChatFlowService;
