import Clientes from "../../asteriskmodels/Clientes";

interface Response {
    cliente: Clientes | null;
}

const infoCliente = async (idPas: number): Promise<Response> => {
    const cliente = await Clientes.findByPk(idPas);
    return { cliente };
};

export default infoCliente;