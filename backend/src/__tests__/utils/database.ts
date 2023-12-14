import {asterisksquelize,sequelize} from "../../database";

const truncate = async (): Promise<void> => {
  await sequelize.truncate({ force: true, cascade: true }) || asterisksquelize.truncate({ force: true, cascade: true });
};

const disconnect = async (): Promise<void> => {
  return sequelize.connectionManager.close() || asterisksquelize.connectionManager.close();
};
export { truncate, disconnect};
