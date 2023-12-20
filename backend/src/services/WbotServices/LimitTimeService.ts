import { QueryTypes } from "sequelize";
import Ticket from "../../models/Ticket";
import { number } from "yup";
interface Time {
    id: number,
    Time: string
}
const query = `SELECT id,CAST(lastInteractionBot AS TIME) AS Time FROM Tickets t WHERE t.status = 'pending'`;
const queryS = `UPDATE Tickets SET STATUS = 'closed' WHERE id = ticketid`;
function toTimestampAndAdd10Minute(horario) {
    var aux = horario.split(':'),
        dt = new Date();
    dt.setHours(aux[0]);
    dt.setMinutes(aux[1]);
    dt.setSeconds(0);
    return forMiliseconds(dt) + 600000;
}
const forMiliseconds = (data:Date):number => {
    const dateNowmiliseconds = (data.getHours() * 60 * 60 * 1000) + (data.getMinutes() * 60 * 1000) + (data.getSeconds() * 1000) + data.getMilliseconds();
    return dateNowmiliseconds;
}
const getDateNow = () => {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    return forMiliseconds(today);
}
const compareTimes = async (data: string): Promise<boolean> => {
    const dateNowmiliseconds = getDateNow();
    const dateLastinteractionMiliseconds = toTimestampAndAdd10Minute(data);
    if (dateLastinteractionMiliseconds >= dateNowmiliseconds) return false;
    return true;
}
const Timer = async (): Promise<any> => {
    const data: Time[] | undefined = await Ticket.sequelize?.query(query, {
        type: QueryTypes.SELECT
    })
    if (data) {
        data.forEach(async (item) => {
            const bool = await compareTimes(item.Time)
            if(!bool){
                const query1 = queryS.replace(`ticketid`,`${item.id}`);
                await Ticket.sequelize?.query(query1, {
                    type: QueryTypes.UPDATE
                })
            }else{}
        })
    }
}
export default Timer;



