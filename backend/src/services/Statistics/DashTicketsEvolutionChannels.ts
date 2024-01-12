import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

// const query = `
// SELECT
//     a.dt_ref,
//     DATE_FORMAT(a.dt_ref, '%d/%m/%Y') AS dt_referencia,
//     a.label,
//     a.qtd,
//     ROUND(100.0 * (a.qtd / total.total_qtd), 2) AS percentual
// FROM (
//     SELECT
//         DATE_FORMAT(t.createdAt, '%Y-%m-%d') AS dt_ref,
//         t.channel AS label,
//         COUNT(1) AS qtd
//     FROM Tickets t
//     WHERE t.tenantId = :tenantId
//         AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
//     GROUP BY DATE_FORMAT(t.createdAt, '%Y-%m-%d'), t.channel
// ) a
// JOIN (
//     SELECT
//         DATE_FORMAT(t.createdAt, '%Y-%m-%d') AS dt_ref,
//         COUNT(1) AS total_qtd
//     FROM Tickets t
//     WHERE t.tenantId = :tenantId
//         AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
//     GROUP BY DATE_FORMAT(t.createdAt, '%Y-%m-%d')
// ) total ON a.dt_ref = total.dt_ref
// ORDER BY 1;
// `;

const query = `SELECT
a.dt_ref,
DATE_FORMAT(a.dt_ref, '%d/%m/%Y') AS dt_referencia,
a.label,
a.qtd,
ROUND(100.0 * (qtd / total_qtd), 2) AS percentual
FROM (
SELECT
    DATE_FORMAT(t.createdAt, '%Y-%m-%d') AS dt_ref,
    t.channel AS label,
    COUNT(1) AS qtd,
    (
    SELECT COUNT(*)
  FROM Tickets 
  WHERE tenantid = 1
  AND date_format(dt_ref, '%Y-%m-%d') BETWEEN '2024-01-05T00:00' AND '2024-01-11T23:59'
  ) AS total_qtd
FROM Tickets t
WHERE t.tenantId = 1
    AND DATE_FORMAT(t.createdAt, '%Y-%m-%d') BETWEEN '2024-01-05T00:00' AND '2024-01-11T23:59'
GROUP BY DATE_FORMAT(t.createdAt, '%Y-%m-%d'), t.channel
) a
ORDER BY 1;`;

const DashTicketsEvolutionChannels = async ({
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

export default DashTicketsEvolutionChannels;
