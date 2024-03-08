require("../bootstrap");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci"
  },
  
  useUTC: true,
  dialect: process.env.DB_DIALECT,
  timezone: "-03:00",
  host: process.env.MYSQL_HOST, 
  port: process.env.DB_PORT,
  database: process.env.MYSQL_DB, 
  username: process.env.MYSQL_USER, 
  password: process.env.MYSQL_PASSWORD, 
  logging: false,
  setTimeout: 99999
};
