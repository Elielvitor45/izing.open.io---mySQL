import asteriskdb from "../../database/asteriskConfig";

const truncate = async (): Promise<void> => {
  await asteriskdb.truncate({ force: true, cascade: true });
};

const disconnect = async (): Promise<void> => {
  return asteriskdb.connectionManager.close();
};

export { truncate, disconnect };
