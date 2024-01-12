import { QueryTypes } from "sequelize";
import {asterisksquelize,sequelize} from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT dt_ref, 
DATE_FORMAT(dt_ref, '%Y/%m/%d') as label,
qtd , 
ROUND(100.0 * (qtd / total_qtd), 2) AS percentual
FROM (
	SELECT 
		date_format(t.createdAt, '%Y-%m-%d') AS dt_ref,
		COUNT(*) AS qtd,
		(
			SELECT COUNT(*)
			FROM Tickets 
			WHERE tenantid = :tenantId
			AND date_format(dt_ref, '%Y-%m-%d') BETWEEN :startDate AND :endDate
		) AS total_qtd
		FROM Tickets t
		WHERE t.tenantid = :tenantId and date_format(t.createdAt, '%Y-%m-%d') BETWEEN :startDate AND :endDate
		GROUP BY dt_ref
) a
ORDER BY dt_ref;`;
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
  });
  return data;
};

export default DashTicketsEvolutionByPeriod;
