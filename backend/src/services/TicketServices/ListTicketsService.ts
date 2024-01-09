import { QueryTypes } from "sequelize";
import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UsersQueues";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string[];
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  isNotAssignedUser?: string;
  queuesIds?: string[];
  includeNotQueueDefined?: string;
  tenantId: string | number;
  profile: string;
  pas: boolean | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
}

interface Response {
  tickets: any[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
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
}: Request): Promise<Response> => {
  // check is admin
  const Pas = pas;
  if (Pas) {
    const query = `SELECT DISTINCT t.id, c.name, c.number, t.codigoPas, DATE_FORMAT(t.createdAt,'%d-%m-%Y') AS created
    FROM Tickets t
    INNER JOIN Contacts c ON c.id = t.contactId
    WHERE t.codigoPas AND t.createdAt BETWEEN DATE_FORMAT(:startDate, '%Y-%m-%d %00:%00:%00') AND DATE_FORMAT(:endDate, '%Y-%m-%d %23:%59:%59')
    GROUP BY 
    t.id,
    t.codigoPas,
    created,
    c.name,
    c.number
    ORDER BY t.createdAt DESC`;
    const tickets: any = await Ticket.sequelize?.query(query, {
      replacements: {
        startDate,
        endDate
      },
      type: QueryTypes.SELECT,
      nest: true
    });
    let count = 0;
    let ticketsLength = 0;
    if (tickets?.length) {
      count = tickets[0].count;
      ticketsLength = tickets.length;
    }
    const hasMore = count > ticketsLength;
    return {
      tickets: tickets || [],
      count,
      hasMore
    };
  }
  const isAdminShowAll = showAll == "true" && profile === "admin";
  const isUnread =
    withUnreadMessages && withUnreadMessages == "true" ? "S" : "N";
  const isNotAssigned =
    isNotAssignedUser && isNotAssignedUser == "true" ? "S" : "N";
  const isShowAll = isAdminShowAll ? "S" : "N";
  const isQueuesIds = queuesIds ? "S" : "N";
  const isSearchParam = searchParam ? "S" : "N";

  if (!status && !isAdminShowAll) {
    // if not informed status and not admin, reject request
    // status = ["open", "pending"];
    throw new AppError("ERR_NO_STATUS_SELECTED", 404);
  }
  if (isAdminShowAll) {
    status = ["open", "pending", "closed"];
  }
  // Verificar se existem filas cadastradas, caso contrário,
  // não aplicar restrição
  const isExistsQueueTenant =
    (await Queue.count({
      where: { tenantId }
    })) > 0
      ? "S"
      : "N";
  // list queues user request
  const queues = await UsersQueues.findAll({
    where: {
      userId
    }
  });

  // mount array ids queues
  let queuesIdsUser = queues.map(q => q.queueId);
  // check is queues filter and verify access user queue
  if (queuesIds) {
    const newArray: number[] = [];
    queuesIds.forEach(i => {
      const idx = queuesIdsUser.indexOf(+i);
      if (idx) {
        newArray.push(+i);
      }
    });
    queuesIdsUser = newArray.length ? newArray : [0];
  }
  // se não existir fila, ajustar para parse do sql
  if (!queuesIdsUser.length) {
    queuesIdsUser = [0];
  }

  const limit = 30;
  const offset = limit * (+pageNumber - 1);
  const query = `
  select
  (SELECT COUNT(*) FROM Tickets) as count,
  c.profilePicUrl,
  c.name,
  u.name as username,
  q.queue,
  t.*
  from Tickets t
  left join Contacts c on t.contactId = c.id
  left join Users u on u.id = t.userId
  left join Queues q on t.queueId = q.id
  where t.tenantId = :tenantId
  and c.tenantId = :tenantId
  and t.status IN ( :status )
  AND ((:isShowAll = 'N' and  (
    (:isExistsQueueTenant = 'S' and t.queueId IN ( :queuesIdsUser ))
    or t.userId = :userId or exists (select 1 from ContactWallets cw where cw.walletId = :userId and cw.contactId = t.contactId) )
  ) OR (:isShowAll = 'S') OR (t.isGroup = true) OR (:isExistsQueueTenant = 'N') )
  AND (( :isUnread = 'S'  and t.unreadMessages > 0) OR (:isUnread = 'N'))
  AND ((:isNotAssigned = 'S' and t.userId is null) OR (:isNotAssigned = 'N'))
  AND ((:isSearchParam = 'S' 
  AND ((CONVERT(t.id,CHAR) LIKE :searchParam) 
  OR (exists (select 1 from Contacts c where c.id = t.contactId and (upper(c.name) like UPPER(:searchParam) or c.number LIKE :searchParam)))) OR (:isSearchParam = 'N'))
  )
  order by t.updatedAt desc
  LIMIT ${limit}
  OFFSET ${offset};
`;
// Nao recebe nenhum valor, ou seja, o erro esta aqui
  const tickets: any = await Ticket.sequelize?.query(query, {
    replacements: {
      tenantId,
      isQueuesIds,
      status,
      isShowAll,
      isExistsQueueTenant,
      queuesIdsUser,
      userId,
      isUnread,
      isNotAssigned,
      isSearchParam,
      searchParam: `%${searchParam}%`,
      limit,
      offset
    },
    type: QueryTypes.SELECT,
    nest: true
  });

  let count = 0;
  let ticketsLength = 0;
  if (tickets?.length) {
    count = tickets[0].count;
    ticketsLength = tickets.length;
  }
  const hasMore = count > offset + ticketsLength;

  return {
    tickets: tickets || [],
    count,
    hasMore
  };
};
export default ListTicketsService;
