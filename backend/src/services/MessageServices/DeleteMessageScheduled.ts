import { QueryTypes } from "sequelize";
import Message from "../../models/Message"
const query = `UPDATE Messages m SET m.isDeleted = 1 WHERE m.idFront = :idFront AND m.tenantId = :tenantId`;
export const DeleteMessageScheduled = async(idFront:string,tenantId:string|number):Promise<void> => {
    await Message.sequelize?.query(query,{
        replacements:{
            idFront,
            tenantId
        },
        type: QueryTypes.UPDATE
    });
}