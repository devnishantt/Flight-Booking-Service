import { Sequelize } from "sequelize";
import { dbConfig } from "../config/serverConfig.js";
import logger from "../config/loggerConfig.js";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: dbConfig.DB_HOST,
  username: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_NAME,
  logging: true,
});

sequelize
  .authenticate()
  .then(() => {
    logger.info("Datebase connection established sucessfully");
  })
  .catch((error) => {
    logger.error(`Unable to connect to the database: ${error}`);
    process.exit(1);
  });

export default sequelize;
