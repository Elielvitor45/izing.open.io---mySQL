import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
    a.label,
    a.qtd,
    ROUND(100.0 * (a.qtd / total.total_qtd), 2) AS percentual
FROM (
    SELECT
        COALESCE(q.queue, 'Não informado') AS label,
        COUNT(1) AS qtd
    FROM Tickets t
    LEFT JOIN Queues q ON (t.queueId = q.id)
    WHERE t.tenantId = :tenantId
        AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
    GROUP BY t.queueId, q.queue
) a
JOIN (
    SELECT
        COALESCE(q.queue, 'Não informado') AS total_label,
        COUNT(1) AS total_qtd
    FROM Tickets t
    LEFT JOIN Queues q ON (t.queueId = q.id)
    WHERE t.tenantId = :tenantId
        AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
    GROUP BY t.queueId, q.queue
) total ON a.label = total.total_label
ORDER BY 2 DESC;
`;

const DashTicketsQueue = async ({
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

export default DashTicketsQueue;
