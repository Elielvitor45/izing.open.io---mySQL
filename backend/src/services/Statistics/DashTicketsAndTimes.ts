import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
SUM(qtd_total_atendimentos) AS qtd_total_atendimentos,
SUM(qtd_demanda_ativa) AS qtd_demanda_ativa,
SUM(qtd_demanda_receptiva) AS qtd_demanda_receptiva,
SEC_TO_TIME(AVG(tma)*60*60) AS TMA,
SEC_TO_TIME(AVG(tme)*60*60) AS TME, 
(SELECT COUNT(1)
 FROM Contacts c 
 WHERE c.tenantId = tenantId
 AND DATE(c.createdAt) BETWEEN @startDate AND @endDate
) AS new_contacts
FROM (
SELECT
  1 AS qtd_total_atendimentos,
  CASE WHEN t.isActiveDemand = 1 THEN 1 ELSE 0 END AS qtd_demanda_ativa,
  CASE WHEN t.isActiveDemand != 1 THEN 1 ELSE 0 END AS qtd_demanda_receptiva,
  TIMESTAMPDIFF(MINUTE, t.createdAt, FROM_UNIXTIME(t.closedAt/1000)) AS tma,
  TIMESTAMPDIFF(MINUTE, t.createdAt, FROM_UNIXTIME(t.startedAttendanceAt/1000)) AS tme
FROM Tickets t
WHERE t.tenantId = tenantId
AND DATE(t.createdAt) BETWEEN @startDate AND @endDate
) a
ORDER BY 1 DESC
`;

const DashTicketsAndTimes = async ({
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

export default DashTicketsAndTimes;
