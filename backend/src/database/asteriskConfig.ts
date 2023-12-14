import { Sequelize } from "sequelize-typescript";
import Clientes from "../asteriskmodels/Clientes";
import { logger } from "../utils/logger";

interface CustomSequelize extends Sequelize {
  afterConnect?: any;
  afterDisconnect?: any;
}

// eslint-disable-next-line
const asteriskDbConfig = require("../config/asteriskdb")

const asteriskSequelize: CustomSequelize = new Sequelize(asteriskDbConfig);

const asteriskmodels = [
  Clientes
];

asteriskSequelize.addModels(asteriskmodels)

asteriskSequelize.afterConnect(() => {
  logger.info("ASTERISK DATABASE CONNECT");
});

asteriskSequelize.afterDisconnect(() => {
  logger.info("ASTERISK DATABASE DISCONNECT");

  // eslint-disable-next-line no-underscore-dangle
  // clearInterval(global._loopDb);
});


export default asteriskSequelize;