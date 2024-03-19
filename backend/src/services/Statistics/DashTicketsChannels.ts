import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
  userId: string | number;
  userProfile: string | number;
}

const query = `
SELECT
    a.label,
    a.qtd,
    ROUND(100.0 * (a.qtd / total.total_qtd), 2) AS percentage
FROM (
    SELECT
        t.channel AS label,
        COUNT(1) AS qtd
    FROM Tickets t
    WHERE t.tenantId = :tenantId
        AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
    GROUP BY t.channel
) a
JOIN (
    SELECT
        COUNT(1) AS total_qtd
    FROM Tickets t
    WHERE t.tenantId = :tenantId
        AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
) total
ORDER BY 2 DESC;
`;

const DashTicketsChannels = async ({
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

export default DashTicketsChannels;
