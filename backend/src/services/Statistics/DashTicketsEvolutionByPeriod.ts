import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
    dt_ref,
    date_format(dt_ref, '%d/%m/%Y') as label,
    qtd,
    ROUND(100.0 * (qtd / total_qtd), 2) AS percentual
FROM (
    SELECT
        date_format(t.createdAt, '%d/%m/%Y') AS dt_ref,
        count(1) AS qtd,
        (
            SELECT count(1)
            FROM Tickets
            WHERE tenantId = @tenantId
            AND date_format(t.createdAt, '%d/%m/%Y') BETWEEN @startDate AND @endDate
        ) AS total_qtd
    FROM Tickets t
    WHERE t.tenantId = @tenantId
    AND date_format(t.createdAt, '%d/%m/%Y') BETWEEN @startDate AND @endDate
    GROUP BY date_format(t.createdAt, '%d/%m/%Y')
) a
ORDER BY dt_ref;
`;

const DashTicketsEvolutionByPeriod = async ({
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

export default DashTicketsEvolutionByPeriod;
