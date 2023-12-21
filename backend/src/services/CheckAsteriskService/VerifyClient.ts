import { boolean, string } from "yup";
import infoCliente from "./CheckPasService"
import Clientes from "../../asteriskmodels/Clientes";
import { response } from "express";

const CheckCustomer = async (idPas: string): Promise<Clientes|undefined> => {
    const pas = parseInt(idPas,10);
    if(pas){
        const cliente = await infoCliente(pas)
        if(cliente) return cliente;
        return undefined;
    }
    return undefined;
}
export default CheckCustomer;