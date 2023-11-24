import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
select dt_ref, date_format(dt_ref, '%d/%m/%Y') dt_referencia , label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  date_format('day', t.createdAt) dt_ref,
  --date_format(date_format('day', t.createdAt), '%d/%m/%Y') ,
  t.channel as label,
  count(1) as qtd
  from Tickets t
  where t.tenantId = @tenantId
  and date_format('day', t.createdAt) BETWEEN @startDate AND @endDate
  group by date_format('day', t.createdAt), t.channel
  ) a
  order by 1
`;

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
