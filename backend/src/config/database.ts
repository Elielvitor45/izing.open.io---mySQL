require("../app/config-env");

module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci"
  },
  // pool: {
  //   max: 100,
  //   min: 5
  // },
  useUTC: true,
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: "-03:00",
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  database: process.env.MYSQL_DB || "wchats",
  username: process.env.MYSQL_USER || "postgres",
  password: process.env.MYSQL_PASSWORD || "marina@0509",
  logging: false
};
