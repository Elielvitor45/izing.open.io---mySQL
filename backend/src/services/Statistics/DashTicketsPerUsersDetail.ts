import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
    email,
    name,
    qtd_em_atendimento,
    qtd_pendentes,
    qtd_resolvidos,
    qtd_por_usuario,
    SEC_TO_TIME(tma) AS tma,
    SEC_TO_TIME(tme) AS tme
FROM (
    SELECT
        t.userId AS email,
        u.name,
        SUM(CASE WHEN t.status = 'open' THEN 1 ELSE 0 END) AS qtd_em_atendimento,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS qtd_pendentes,
        SUM(CASE WHEN t.status = 'closed' THEN 1 ELSE 0 END) AS qtd_resolvidos,
        COUNT(*) AS qtd_por_usuario,
        AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.closedAt/1000))*60) AS tma,
        AVG(TIMESTAMPDIFF(SECOND, t.createdAt, FROM_UNIXTIME(t.startedAttendanceAt/1000))*60) AS tme
    FROM Tickets t
    LEFT JOIN Users u ON t.userId = u.id
    LEFT JOIN Queues q ON q.id = t.queueId
    WHERE t.tenantId = @tenantId
    AND DATE(t.createdAt) BETWEEN @startDate AND @endDate
    GROUP BY t.userId, u.name
) a
ORDER BY qtd_por_usuario DESC;

`;

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
