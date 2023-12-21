import Clientes from "../../asteriskmodels/Clientes";

const infoCliente = async (idPas: number): Promise<Clientes|null> => {
    const cliente = await Clientes.findByPk(idPas);
    return cliente;
};

export default infoCliente;