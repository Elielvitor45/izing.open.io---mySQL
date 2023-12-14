import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}
//Query antiga
// const query = `
// SELECT
// DISTINCT(email),
// name,
// SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_em_atendimento,
// SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_pendentes,
// SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_resolvidos,
// COUNT(*) OVER (PARTITION BY email) AS qtd_por_usuario,
// MIN(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS menor_tempo_por_usuario,
// MAX(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS maior_tempo_por_usuario,
// AVG(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS tempo_medio_por_usuario
// FROM Tickets t
// LEFT JOIN Users u ON t.userId = u.id
// LEFT JOIN Queues q ON q.id = t.queueId
// WHERE t.tenantId = @tenantId
// AND DATE(t.createdAt) BETWEEN @startDate AND @endDate
// ORDER BY 6 DESC
// `;

const query = `SELECT
DISTINCT(t.email),
name,
SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_em_atendimento,
SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_pendentes,
SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) OVER (PARTITION BY email) AS qtd_resolvidos,
COUNT(*) OVER (PARTITION BY email) AS qtd_por_usuario,
MIN(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS menor_tempo_por_usuario,
MAX(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS maior_tempo_por_usuario,
AVG(TIMESTAMPDIFF(MINUTE, FROM_UNIXTIME(t.startedAttendanceAt/1000), FROM_UNIXTIME(t.closedAt/1000))) OVER (PARTITION BY email) AS tempo_medio_por_usuario
FROM Tickets t
LEFT JOIN Users u ON t.userId = u.id
LEFT JOIN Queues q ON q.id = t.queueId
WHERE t.tenantId = :tenantId
AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
ORDER BY 6 DESC`;

const StatisticsPerUser = async ({
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
    // logging: console.log
  });
  return data;
};

export default StatisticsPerUser;
