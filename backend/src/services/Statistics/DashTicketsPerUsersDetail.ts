import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

// const query = `
// SELECT
// DISTINCT(t.email),
// name,
// SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_em_atendimento,
// SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_pendentes,
// SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_resolvidos,
// COUNT(*) OVER (PARTITION BY t.email) AS qtd_por_usuario,
// SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.closedAt/1000))*60)) AS tma,
// SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.startedAttendanceAt/1000))*60)) AS tme
// FROM tickets t
// LEFT JOIN Users u ON t.userId = u.id
// LEFT JOIN Queues q ON q.id = t.queueId
// WHERE t.tenantId = @tenantId
// AND DATE(t.createdAt) BETWEEN @startDate AND @endDate
// ORDER BY 6 DESC
// `;
const query = `
SELECT
DISTINCT(t.email),
name,
SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_em_atendimento,
SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_pendentes,
SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) OVER (PARTITION BY t.email) AS qtd_resolvidos,
COUNT(*) OVER (PARTITION BY t.email) AS qtd_por_usuario,
SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.closedAt/1000))*60)) AS tma,
SEC_TO_TIME(AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.startedAttendanceAt/1000))*60)) AS tme
FROM Tickets t
LEFT JOIN Users u ON t.userId = u.id
LEFT JOIN Queues q ON q.id = t.queueId
WHERE t.tenantId = :tenantId
AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
GROUP BY 
t.email,
t.userId ,
u.name,
t.status,
u.id,
t.createdAt,
t.tenantId
ORDER BY 6 DESC`;
const DashTicketsPerUsersDetail = async ({
  startDate,
  endDate,
  tenantId
}: Request): Promise<any[]> => {
  const data = await sequelize.query(query, {
    replacements: {
      tenantId,
      startDate,
      endDate
    },
    type: QueryTypes.SELECT
  });
  return data;
};

export default DashTicketsPerUsersDetail;
